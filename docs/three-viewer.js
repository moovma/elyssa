import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'https://unpkg.com/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------ */
/*  Settings you can tweak                                             */
/* ------------------------------------------------------------------ */
const CONFIG = {
  modelUrl: 'elyssa_3d/elyssa.glb',
  pcbColor: 0x0dde3e,        // soldermask green
  pcbOpacity: 0.7,           // 1 = solid, lower = traces more visible
  boxColor: 0xccff00,        // colour of the selection box
  boxFillOpacity: 0.35,      // 0 = lines only, 1 = solid fill
  clusterGap: 0.004,         // parts closer than this (fraction of board size) share a box; separate parts get their own
  boxPadding: 0.012,         // gap between part and box, as a fraction of the board size
  zoomOut: 1.5,              // smaller = bigger board
  envIntensity: 0.7,         // reflections on components
  hoverHeight: 0.012,        // up/down float, as a fraction of the board size
  swayAmount: 0.03,          // tiny tilt while floating (radians), 0 = none
  flipSpeed: 3.5,            // higher = faster flip
  flipAxis: 'y',             // 'y' = turn like a page, 'x' = top/bottom
  showAxes: false,           // debug axes at 0,0,0
  debugHud: false,            // info box at the bottom-left of the viewer (set false to hide)

  // ---- scroll-driven highlighting ----
  // Any element with data-component="<key>" (that is not a .component-button)
  // becomes a scroll step: when it crosses the middle band of the screen,
  // the matching part is highlighted.
  scrollSelector: '[data-component]:not(.component-button)',
  scrollOnButtonClick: false,        // true = clicking a button also scrolls to its step

  // Exact component nodes of the model (KiCad pattern "<Ref>_<Footprint>").
  // RegExp entries match the start of the name; strings must match exactly.
  // (three.js removes dots from names, so "P0.4mm" becomes "P04mm" - the patterns avoid dots)
  partNames: {
    mcu: [/^U1_QFN-56/i],                 // ESP32-S3FN8
    imu: [/^U2_LGA-14/i],                 // LSM6DS3TR-C
    bms: [/^U13_MSOP-10/i],               // BQ24092
    buck: [/^U9_SOT-23-5/i],              // buck regulator
    rgb: [/^U4_LED-ARRAY/i, /^D12_/i, /^D15_/i, /^D16_/i, /^D17_/i],
    sd: [/^NAUO1_TF-01A/i],               // microSD socket (back side)
    usb: [/^J5_/i],                       // USB-C receptacle
    jst: [/^J11_/i],                      // JST-GH 4-pin connector
    buttons: [/^SW5_/i, /^SW6_/i],        // reset / boot buttons
    xtal: [/^Y1_/i, /^Y2_/i],             // 32 kHz + main crystal
    power: [/^L4_/i, /^L3_/i, /^L6_/i, /^D1_D_SMA/i, /^Q1_/i, /^U11_/i, /^C50_/i]
  }
};

/* ------------------------------------------------------------------ */
/*  DOM                                                                */
/* ------------------------------------------------------------------ */
const viewer = document.querySelector('#board-viewer');
const statusText = document.querySelector('#model-status-text');
const statusDot = document.querySelector('.status-dot');
const detail = document.querySelector('#component-detail');
const componentButtons = document.querySelectorAll('.component-button');

/* ------------------------------------------------------------------ */
/*  Renderer, camera, lights                                           */
/* ------------------------------------------------------------------ */
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 100);
camera.up.set(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; // ACES washed greens and whites out
viewer.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(2, 4, 5);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x9fd0ff, 0.6);
rimLight.position.set(-3, 1, -2);
scene.add(rimLight);

/* ------------------------------------------------------------------ */
/*  Pivot hierarchy                                                    */
/*  floatGroup   hovers / sways, always centred on 0,0,0               */
/*   flipGroup   turns the board over to show the back (microSD)       */
/*    orientGroup  fixes the KiCad "Z up" export                       */
/*     model     shifted so the BOARD CENTRE sits on the pivot         */
/* ------------------------------------------------------------------ */
const floatGroup = new THREE.Group();
const flipGroup = new THREE.Group();
const orientGroup = new THREE.Group();
orientGroup.rotation.x = Math.PI / 2;
floatGroup.add(flipGroup);
flipGroup.add(orientGroup);
scene.add(floatGroup);

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */
// "U1" must not match "U13": a reference is not followed by a digit
const ref = (id) => new RegExp(`(^|[^a-z0-9])${id}(?![0-9])`, 'i');

// Fallback automatic detection (used only if partNames matches nothing)
const componentMatchers = {
  mcu: [ref('U1'), /QFN-?56/i],
  imu: [ref('U2'), /LGA-?14/i],
  bms: [ref('U13'), /MSOP-?10/i],
  buck: [ref('U9'), /SOT-?23-?5/i],
  rgb: [ref('U4'), ref('D12'), ref('D15'), ref('D16'), ref('D17'), /LED-ARRAY/i],
  sd: [/NAUO1/i, /TF-?01A/i],
  usb: [ref('J5'), /USB[-_]?C/i],
  jst: [ref('J11'), /JST[-_]?GH/i],
  buttons: [ref('SW5'), ref('SW6'), /TS-?1088/i],
  xtal: [ref('Y1'), ref('Y2'), /Crystal/i],
  power: [ref('L4'), ref('L3'), ref('L6'), ref('D1'), ref('Q1'), ref('U11'), ref('C50')]
};

const componentDetails = {
  mcu: 'Wireless brain · dual-core 240 MHz',
  imu: 'Motion sense · accelerometer + gyroscope',
  bms: 'Battery care · LiPo charging and power path',
  buck: 'Power rail · efficient voltage conversion',
  rgb: 'Visual feedback · red, green and blue channels',
  sd: 'Local storage · dedicated microSD SPI bus',
  usb: 'USB-C · power, programming and native USB',
  jst: 'JST-GH 4-pin · I2C expansion connector',
  buttons: 'Reset and boot buttons',
  xtal: 'Clocks · 32.768 kHz RTC + main crystal',
  power: 'Power stage · inductors, diode, MOSFET and bulk capacitance'
};

// the board stays at 0,0,0; only parts on the back side turn it over
const componentView = {
  mcu: { flip: 0 },
  imu: { flip: 0 },
  bms: { flip: 0 },
  buck: { flip: 0 },
  rgb: { flip: 0 },
  sd: { flip: Math.PI },
  usb: { flip: 0 },
  jst: { flip: 0 },
  buttons: { flip: 0 },
  xtal: { flip: 0 },
  power: { flip: 0 }
};

let modelRoot = null;
let targetFlip = 0;
let currentKey = 'mcu';
let board = { w: 1, h: 1, d: 0.1, max: 1 };
let meshCount = 0;
const componentMeshes = {};   // key -> meshes that make up the part

const asArray = (m) => (Array.isArray(m) ? m : [m]);

function labelOf(object) {
  if (object.userData.label !== undefined) return object.userData.label;
  const names = [];
  for (let o = object; o && o !== modelRoot; o = o.parent) {
    names.push(o.name, o.userData?.name || '');
  }
  object.userData.label = names.join(' ');
  return object.userData.label;
}
const matches = (object, matchers) => matchers.some((m) => m.test(labelOf(object)));

/* ------------------------------------------------------------------ */
/*  Debug HUD + click-to-name                                          */
/* ------------------------------------------------------------------ */
let hud = null;
function setupHud() {
  if (!CONFIG.debugHud) return;
  if (getComputedStyle(viewer).position === 'static') viewer.style.position = 'relative';
  hud = document.createElement('div');
  hud.style.cssText = 'position:absolute;left:8px;bottom:8px;max-width:92%;padding:6px 8px;' +
    'font:11px/1.4 ui-monospace,Consolas,monospace;color:#ccff00;background:rgba(0,0,0,.75);' +
    'border:1px solid #444;z-index:5;pointer-events:none;white-space:pre-wrap;word-break:break-all';
  hud.textContent = 'loading model...';
  viewer.appendChild(hud);
}
function updateHud(extra) {
  if (!hud) return;
  const counts = Object.keys(componentMatchers).map((k) => `${k}:${(componentMeshes[k] || []).length}`).join('  ');
  let text = `meshes: ${meshCount}   meshes found per part -> ${counts}\n`;
  if (meshCount > 0 && meshCount < 15) text += 'WARNING: very few meshes, parts look merged inside the GLB\n';
  hud.textContent = text + (extra || 'click a part on the board to see its name');
}
setupHud();
console.log('%cELYSSA VIEWER v6 loaded', 'color:#ccff00;background:#000;padding:2px 6px');
if (hud) hud.textContent = 'viewer v6 loaded, loading model...';

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function onPick(e) {
  if (!modelRoot) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObject(modelRoot, true).filter((h) => h.object.isMesh && !h.object.userData.isSelection);
  const hit = hits.find((h) => h.object.userData.role === 'part') || hits[0];
  if (!hit) { updateHud('nothing under the cursor'); return; }
  const o = hit.object;
  const info = `${o.userData.role}: ${labelOf(o).trim().replace(/\s+/g, ' ')}`;
  console.log('picked', o, info);
  updateHud(`picked -> ${info}`);
}

/* ------------------------------------------------------------------ */
/*  Highlight: the whole part changes colour                           */
/* ------------------------------------------------------------------ */
let selectionBox = null;

// one group of meshes per entry of partNames (so every LED gets its own box);
// falls back to a single group when no explicit names are set
function groupsFor(key) {
  const names = CONFIG.partNames[key] || [];
  const groups = [];
  names.forEach((n) => {
    const set = new Set();
    modelRoot.traverse((node) => {
      const hit = n instanceof RegExp ? n.test(node.name) : n.toLowerCase() === node.name.toLowerCase();
      if (hit) node.traverse((c) => { if (c.isMesh && isPartRole(c)) set.add(c); });
    });
    if (set.size) groups.push([...set]);
  });
  if (!groups.length && (componentMeshes[key] || []).length) groups.push(componentMeshes[key]);

  // split every group into physically separate pieces (e.g. 4 LEDs -> 4 boxes),
  // even if the model keeps them under one node
  return groups.flatMap(splitByDistance);
}

function splitByDistance(meshes) {
  const gap = board.max * CONFIG.clusterGap;
  const boxes = meshes.map((m) => m.userData.box.clone().expandByScalar(gap));
  const parent = meshes.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < meshes.length; i++) {
    for (let j = i + 1; j < meshes.length; j++) {
      if (boxes[i].intersectsBox(boxes[j])) parent[find(i)] = find(j);
    }
  }
  const clusters = new Map();
  meshes.forEach((mesh, i) => {
    const r = find(i);
    if (!clusters.has(r)) clusters.set(r, []);
    clusters.get(r).push(mesh);
  });
  return [...clusters.values()];
}

function clearSelectionBox() {
  if (!selectionBox) return;
  modelRoot.remove(selectionBox);
  selectionBox.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  selectionBox = null;
}

function setHighlight(component) {
  if (!modelRoot) return;
  clearSelectionBox();

  // boxes are measured in the model's own space and attached to it,
  // so they keep following the board while it floats and flips
  modelRoot.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(modelRoot.matrixWorld).invert();
  const m = new THREE.Matrix4();
  const tmp = new THREE.Box3();
  const pad = board.max * CONFIG.boxPadding * 2;
  selectionBox = new THREE.Group();

  groupsFor(component).forEach((meshes) => {
    const box = new THREE.Box3();
    meshes.forEach((mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      m.multiplyMatrices(inv, mesh.matrixWorld);
      tmp.copy(mesh.geometry.boundingBox).applyMatrix4(m);
      box.union(tmp);
    });
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3()).addScalar(pad);
    const center = box.getCenter(new THREE.Vector3());
    const cube = new THREE.BoxGeometry(size.x, size.y, size.z);

    const fill = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({
      color: CONFIG.boxColor,
      transparent: true,
      opacity: CONFIG.boxFillOpacity,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    }));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cube), new THREE.LineBasicMaterial({
      color: CONFIG.boxColor, depthTest: false, toneMapped: false
    }));
    [fill, edges].forEach((o) => { o.position.copy(center); o.renderOrder = 10; o.userData.isSelection = true; selectionBox.add(o); });
  });

  modelRoot.add(selectionBox);
  if (detail) detail.textContent = componentDetails[component] || '';
}

function focusComponent(name) {
  const key = componentMatchers[name] ? name : 'mcu';
  currentKey = key;
  targetFlip = componentView[key].flip;
  componentButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.component === key));
  setHighlight(key);
  updateHud(`selected: ${key} (${(componentMeshes[key] || []).length} meshes)`);
}

/* ------------------------------------------------------------------ */
/*  Material styling                                                   */
/* ------------------------------------------------------------------ */
const SILK_RE = /silk|legend/i;
const MASK_RE = /solder\s*_?mask|soldermask|(^|[^a-z])mask/i;
const COPPER_RE = /copper|gold|enig|hasl|via|(^|[^a-z])pads?($|[^a-z])/i;
// layer meshes of this model: board_copper, board_pad, board_via, board_PCB, board_silkscreen(_001), board_soldermask(_001)
const BOARD_LAYER_RE = /(^|\s)board_(silkscreen|soldermask|copper|pad|via|pcb)/i;

function styleSilkscreen(mat) {
  mat.map = null;
  mat.vertexColors = false;
  mat.color.set(0xffffff);
  mat.emissive.set(0xffffff);
  mat.emissiveIntensity = 0.9;
  mat.roughness = 1;
  mat.metalness = 0;
  mat.envMapIntensity = 0;
  mat.toneMapped = false;
  mat.transparent = false;
  mat.opacity = 1;
  mat.side = THREE.DoubleSide;
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -1;
  mat.needsUpdate = true;
}

function stylePcb(mat) {
  mat.map = null;
  mat.vertexColors = false;
  mat.color.set(CONFIG.pcbColor);
  mat.roughness = 0.38;
  mat.metalness = 0;
  mat.envMapIntensity = CONFIG.envIntensity;
  mat.transparent = true;          // see the traces through the solder mask
  mat.opacity = CONFIG.pcbOpacity;
  mat.depthWrite = false;
  mat.needsUpdate = true;
}

const isGreenish = (m) => m.color && m.color.g > m.color.r * 1.05 && m.color.g > m.color.b * 1.05;

const isPartRole = (m) => m.userData.role === 'part';

function resolvePart(key, matchers, meshes) {
  // 1) explicit names win: every mesh under those nodes, except pads/copper
  const names = CONFIG.partNames[key] || [];
  if (names.length) {
    const out = new Set();
    modelRoot.traverse((node) => {
      const hit = names.some((n) => (n instanceof RegExp ? n.test(node.name) : n.toLowerCase() === node.name.toLowerCase()));
      if (hit) node.traverse((c) => { if (c.isMesh && isPartRole(c)) out.add(c); });
    });
    if (out.size) return [...out];
    console.warn(`partNames for "${key}" matched nothing, using automatic detection.`);
  }

  // 2) automatic: meshes whose name matches (body, leads, pads...)
  const seeds = meshes.filter((m) => m.userData.role !== 'mask' && m.userData.role !== 'silk' && matches(m, matchers));
  if (!seeds.length) return [];

  // the part is whatever real component sits on the same side, inside the seeds' footprint
  // (so if only the pads were matched, we still pick the body that covers them)
  const side = seeds.reduce((sum, m) => sum + m.userData.side, 0) >= 0 ? 1 : -1;
  const box = new THREE.Box3();
  seeds.forEach((m) => box.union(m.userData.box));
  const margin = board.max * 0.01;
  box.min.x -= margin; box.min.y -= margin; box.max.x += margin; box.max.y += margin;
  const fp = box.getSize(new THREE.Vector3());
  const footprintArea = fp.x * fp.y;

  const out = new Set(seeds.filter(isPartRole));
  const c = new THREE.Vector3();
  meshes.forEach((m) => {
    if (!isPartRole(m) || m.userData.side !== side) return;
    m.userData.box.getCenter(c);
    const inside = c.x >= box.min.x && c.x <= box.max.x && c.y >= box.min.y && c.y <= box.max.y;
    if (inside && m.userData.area >= footprintArea * 0.15) out.add(m);
  });
  return [...out];
}

function prepareModel(model) {
  scene.updateMatrixWorld(true);
  const meshes = [];
  model.traverse((o) => { if (o.isMesh) meshes.push(o); });
  meshCount = meshes.length;

  const flatLimit = board.d * 0.03;  // pads / copper are paper-thin
  const unknownSpan = [];
  let maskFound = false;

  // 1) classify every mesh
  meshes.forEach((mesh) => {
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();
    const mats = asArray(mesh.material);
    const label = `${labelOf(mesh)} ${mats.map((m) => m.name).join(' ')}`;
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const spansBoard = size.x >= board.w * 0.6 && size.y >= board.h * 0.6;
    mesh.userData.box = box;
    mesh.userData.area = size.x * size.y;

    // Only paper-thin or board-sized meshes can be PCB layers.
    // Anything with real height (connectors, ICs, switches...) is a part,
    // whatever its material is called ("gold", "pad"...).
    const flat = size.z <= flatLimit;
    const layerName = labelOf(mesh).match(BOARD_LAYER_RE);
    let role;
    if (layerName) {
      const n = layerName[0].toLowerCase();
      role = n.includes('silk') ? 'silk' : n.includes('mask') ? 'mask' : 'copper'; // pad/via/PCB keep their own look
    } else if (!spansBoard && !flat) role = 'part';
    else if (SILK_RE.test(label)) role = 'silk';
    else if (MASK_RE.test(label)) role = 'mask';
    else if (spansBoard) {
      if (COPPER_RE.test(label)) role = 'copper';
      else if (mats.some(isGreenish)) role = 'mask';
      else { role = 'copper'; unknownSpan.push(mesh); }
    } else role = 'copper';   // flat little thing on the board = pad / trace

    if (role === 'mask') maskFound = true;
    mesh.userData.role = role;
    mesh.userData.small = !spansBoard;
  });

  // 2) if no mask was recognised, the biggest unknown board-sized mesh is the PCB
  if (!maskFound && unknownSpan.length) {
    unknownSpan.sort((a, b) => b.userData.area - a.userData.area);
    unknownSpan[0].userData.role = 'mask';
  }

  // 3) style by role
  meshes.forEach((mesh) => {
    const role = mesh.userData.role;
    asArray(mesh.material).forEach((m) => {
      if (role === 'silk') styleSilkscreen(m);
      else if (role === 'mask') stylePcb(m);
      else m.envMapIntensity = CONFIG.envIntensity;   // copper/pads keep their original look
    });
    mesh.renderOrder = role === 'silk' ? 2 : role === 'mask' ? 1 : 0;
    mesh.userData.base = asArray(mesh.material).map((m) => ({
      color: m.color.clone(),
      emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0),
      intensity: m.emissiveIntensity ?? 0,
      roughness: m.roughness ?? 0.5,
      metalness: m.metalness ?? 0,
      map: m.map || null,
      vertexColors: !!m.vertexColors
    }));
  });

  // 4) which meshes make up each selectable part (never the pads/copper)
  const v = new THREE.Vector3();
  const maskMesh = meshes.find((m) => m.userData.role === 'mask');
  const pcbZ = maskMesh ? maskMesh.userData.box.getCenter(v).z : 0;   // PCB plane
  meshes.forEach((m) => { m.userData.side = m.userData.box.getCenter(v).z >= pcbZ ? 1 : -1; });

  Object.entries(componentMatchers).forEach(([key, matchers]) => {
    componentMeshes[key] = resolvePart(key, matchers, meshes);
    if (!componentMeshes[key].length) console.warn(`No 3D part found for "${key}". Use CONFIG.partNames.`);
  });

  // debugging helpers
  const report = meshes.map((m) => ({
    mesh: m.name,
    material: asArray(m.material).map((x) => x.name).join(','),
    role: m.userData.role,
    path: labelOf(m).trim().replace(/\s+/g, ' ').slice(0, 70)
  }));
  console.table(report);
  window.__elyssaMeshes = report;
  const tree = [];
  (function walk(n, depth) {
    if (depth > 4) return;
    const sz = new THREE.Box3().setFromObject(n).getSize(new THREE.Vector3());
    tree.push({ depth, name: n.name || '(unnamed)', type: n.type, size: `${sz.x.toFixed(3)} x ${sz.y.toFixed(3)} x ${sz.z.toFixed(3)}` });
    n.children.forEach((ch) => walk(ch, depth + 1));
  })(model, 0);
  window.__elyssaTree = tree;
  // in the console: copy(__elyssaNames())  -> copies the whole node list to the clipboard
  window.__elyssaNames = () => tree.map((t) => `${'  '.repeat(t.depth)}${t.name} [${t.type}] ${t.size}`).join('\n');
  window.__elyssaParts = (key) => (componentMeshes[key] || []).map((m) => labelOf(m).trim());
  window.__elyssaFind = (text) => report.filter((r) => new RegExp(text, 'i').test(`${r.path} ${r.material}`));
}

/* ------------------------------------------------------------------ */
/*  Load the model                                                     */
/* ------------------------------------------------------------------ */
let pendingKey = null;   // a scroll step that fired before the model finished loading

new GLTFLoader().load(CONFIG.modelUrl, (gltf) => {
  const model = gltf.scene;
  modelRoot = model;

  // board centre -> pivot, so it turns around its middle
  const raw = new THREE.Box3().setFromObject(model);
  model.position.sub(raw.getCenter(new THREE.Vector3()));
  orientGroup.add(model);
  scene.updateMatrixWorld(true);

  const size = new THREE.Box3().setFromObject(orientGroup).getSize(new THREE.Vector3());
  board = { w: size.x, h: size.y, d: size.z, max: Math.max(size.x, size.y, size.z) };
  window.__elyssaModelBounds = board;

  const distance = board.max * 4;
  camera.position.set(0, 0, distance);
  camera.near = distance - board.max * 2;
  camera.far = distance + board.max * 2;
  camera.lookAt(0, 0, 0);

  if (CONFIG.showAxes) scene.add(new THREE.AxesHelper(board.max * 0.7));

  prepareModel(model);
  resize();

  statusText.textContent = '3D model ready';
  statusDot.classList.add('is-ready');
  focusComponent(pendingKey || 'mcu');
}, undefined, (error) => {
  console.error('Elyssa GLB failed to load', error);
  statusText.textContent = `3D model unavailable: ${error?.message || 'unsupported GLB'}`;
});

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */
function requestComponent(key) {
  if (!modelRoot) { pendingKey = key; return; }
  focusComponent(key);
}

componentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.component;
    requestComponent(key);
    if (CONFIG.scrollOnButtonClick) {
      const step = document.querySelector(`${CONFIG.scrollSelector}[data-component="${key}"]`);
      if (step) step.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});
renderer.domElement.addEventListener('click', onPick);
window.addEventListener('board-component-change', (event) => requestComponent(event.detail));

/* ------------------------------------------------------------------ */
/*  Scroll-driven colour change                                        */
/*  Steps are found in this order:                                     */
/*   1) elements with data-component="<key>"                           */
/*   2) otherwise, headings whose text matches the keywords below      */
/*      (e.g. "microSD socket" -> sd), the step is the heading's block */
/* ------------------------------------------------------------------ */
const STEP_KEYWORDS = [            // order matters: first match wins
  ['sd', /micro\s*-?sd|sd card|\bsd\b|storage/i],
  ['usb', /usb/i],
  ['jst', /jst|qwiic|stemma|connector/i],
  ['buttons', /button|reset|boot/i],
  ['xtal', /crystal|clock|oscillator/i],
  ['rgb', /rgb|led/i],
  ['bms', /battery|bms|charg|lipo/i],
  ['buck', /buck|regulator|power rail/i],
  ['power', /power stage|inductor|mosfet/i],
  ['imu', /imu|motion|gyro|accelero|lsm6/i],
  ['mcu', /esp32|mcu|processor|wireless|brain/i]
];

function findSteps() {
  const out = [];
  const tagged = document.querySelectorAll(CONFIG.scrollSelector);
  tagged.forEach((el) => {
    if (componentMatchers[el.dataset.component]) out.push({ el, key: el.dataset.component });
  });
  if (out.length) return out;

  const used = new Set();
  document.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    if (viewer.contains(h)) return;
    const text = h.textContent || '';
    const hit = STEP_KEYWORDS.find(([key, re]) => re.test(text) && !used.has(key));
    if (!hit) return;
    used.add(hit[0]);
    const block = h.closest('section, article, li') || h.parentElement;
    out.push({ el: block, key: hit[0] });
  });
  return out;
}

function setupScrollSteps() {
  const steps = findSteps();
  console.log('scroll steps found:', steps.map((s) => s.key));
  if (hud) hud.dataset.steps = steps.length;
  window.__elyssaSteps = steps;
  if (!steps.length) { updateHud('no scroll steps found: add data-component="sd" etc. to your sections'); return; }

  let ticking = false;
  const check = () => {
    ticking = false;
    const mid = window.innerHeight / 2;
    let best = null, bestDist = Infinity;
    steps.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      if (r.height === 0) return;
      const dist = (r.top <= mid && r.bottom >= mid) ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist) { bestDist = dist; best = s; }
    });
    if (best && best.key !== currentKey) requestComponent(best.key);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

  // capture = true also catches scrolling inside nested scroll containers
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onScroll);
  check();
}
setupScrollSteps();

/* ------------------------------------------------------------------ */
function resize() {
  const width = viewer.clientWidth || 1;
  const height = viewer.clientHeight || 1;
  const aspect = width / height;
  const half = Math.max(board.h / 2, board.w / 2 / aspect) * CONFIG.zoomOut;
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.top = half;
  camera.bottom = -half;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
new ResizeObserver(resize).observe(viewer);
resize();

/* ------------------------------------------------------------------ */
/*  Animation: hover at 0,0,0 + flip only for back-side parts          */
/* ------------------------------------------------------------------ */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (modelRoot) {
    const k = 1 - Math.exp(-dt * CONFIG.flipSpeed);
    const axis = CONFIG.flipAxis;
    flipGroup.rotation[axis] += (targetFlip - flipGroup.rotation[axis]) * k;

    floatGroup.position.set(0, Math.sin(t * 1.4) * board.max * CONFIG.hoverHeight, 0);
    floatGroup.rotation.set(
      Math.sin(t * 0.9) * CONFIG.swayAmount,
      Math.sin(t * 0.7) * CONFIG.swayAmount * 1.3,
      0
    );
  }
  renderer.render(scene, camera);
}
animate();