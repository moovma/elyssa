'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// Type-only import: erased at build time, so three.js is NOT in this file's static bundle.
// Runtime classes come from the dynamic imports in loadThreeLibs() below.
import type * as THREE from 'three';

type ThreeModule = typeof THREE;
type GLTFLoaderModule = typeof import('three/examples/jsm/loaders/GLTFLoader.js');
type DRACOLoaderModule = typeof import('three/examples/jsm/loaders/DRACOLoader.js');
type OrbitControlsModule = typeof import('three/examples/jsm/controls/OrbitControls.js');
type RoomEnvironmentModule = typeof import('three/examples/jsm/environments/RoomEnvironment.js');

interface ThreeLibs {
  GLTFLoader: GLTFLoaderModule['GLTFLoader'];
  DRACOLoader: DRACOLoaderModule['DRACOLoader'];
  OrbitControls: OrbitControlsModule['OrbitControls'];
  RoomEnvironment: RoomEnvironmentModule['RoomEnvironment'];
}

/**
 * Runtime three.js namespace. Assigned once by loadThreeLibs() before any helper below runs.
 * (Type positions use `THREE.*`, runtime positions use `T.*`.)
 */
let T!: ThreeModule;

/* ------------------------------------------------------------------ */
/*  Settings from docs/three-viewer.js (original moovma.github.io)      */
/* ------------------------------------------------------------------ */
const CONFIG = {
  modelUrl: '/elyssa_3d/elyssa-compressed.glb', // Draco-compressed GLB: the ONLY model this page loads
  dracoDecoderPath: '/draco/', // copy of node_modules/three/examples/jsm/libs/draco/gltf/ in /public/draco
  maxPixelRatio: 2,
  maxTilt: 0.35, // radians the user can tilt the board up/down with OrbitControls
  pcbColor: 0x0b8a3e, // solder-mask green
  pcbOpacity: 0.7, // 1 = solid, lower = traces more visible
  boxColor: 0xccff00, // colour of the selection box
  boxFillOpacity: 0.35, // 0 = lines only, 1 = solid fill
  clusterGap: 0.004, // parts closer than this share a box
  boxPadding: 0.012, // gap between part and box
  zoomOut: 1.5, // 1.5 matches original moovma.github.io
  envIntensity: 0.7, // reflections on components
  hoverHeight: 0.012, // up/down float, fraction of board size
  swayAmount: 0.03, // tiny tilt while floating (radians)
  flipSpeed: 3.5, // higher = faster flip

  partNames: {
    mcu: [/^U1_QFN-56/i],
    imu: [/^U2_LGA-14/i],
    bms: [/^U13_MSOP-10/i],
    buck: [/^U9_SOT-23-5/i],
    rgb: [/^U4_LED-ARRAY/i, /^D12_/i, /^D15_/i, /^D16_/i, /^D17_/i],
    sd: [/^NAUO1_TF-01A/i],
    usb: [/^J5_/i],
    jst: [/^J11_/i],
    buttons: [/^SW5_/i, /^SW6_/i],
    xtal: [/^Y1_/i, /^Y2_/i],
    power: [/^L4_/i, /^L3_/i, /^L6_/i, /^D1_D_SMA/i, /^Q1_/i, /^U11_/i, /^C50_/i],
  } as Record<string, (RegExp | string)[]>,
};

// "U1" must not match "U13": a reference is not followed by a digit
const ref = (id: string) => new RegExp(`(^|[^a-z0-9])${id}(?![0-9])`, 'i');

const componentMatchers: Record<string, (RegExp | string)[]> = {
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
  power: [ref('L4'), ref('L3'), ref('L6'), ref('D1'), ref('Q1'), ref('U11'), ref('C50')],
};

const componentView: Record<string, { flip: number }> = {
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
  power: { flip: 0 },
};

interface ComponentInfo {
  id: string;
  num: string;
  title: string;
  description: string;
  flip: number;
}

const COMPONENTS: ComponentInfo[] = [
  {
    id: 'mcu',
    num: '01',
    title: 'ESP32-S3FN8 MCU',
    description: "The board's main computer: dual-core 240 MHz processing with Wi-Fi and Bluetooth LE 5 for connected builds.",
    flip: 0,
  },
  {
    id: 'imu',
    num: '02',
    title: '6-axis IMU',
    description: 'The LSM6DS3TR-C reads acceleration, rotation and temperature on its own I2C bus, ready for gestures and orientation.',
    flip: 0,
  },
  {
    id: 'bms',
    num: '03',
    title: 'LiPo / BMS',
    description: 'The onboard BQ24092 handles battery charging and power-path management for portable prototypes.',
    flip: 0,
  },
  {
    id: 'buck',
    num: '04',
    title: 'Buck converter',
    description: 'A dedicated power rail keeps the board supplied efficiently when your project is drawing current.',
    flip: 0,
  },
  {
    id: 'rgb',
    num: '05',
    title: 'RGB LED array',
    description: 'Three independent channels give your firmware an immediate visual signal: red, green, blue or any mix.',
    flip: 0,
  },
  {
    id: 'sd',
    num: '06',
    title: 'microSD socket',
    description: 'Local storage on a dedicated SPI bus. Selecting this step turns the board to reveal the socket on the back.',
    flip: Math.PI,
  },
];

type Role = 'part' | 'copper' | 'mask' | 'silk';
type StdMat = THREE.MeshStandardMaterial;

interface Board {
  w: number;
  h: number;
  d: number;
  max: number;
}

interface LoadedData {
  model: THREE.Group;
  board: Board;
  componentMeshes: Record<string, THREE.Mesh[]>;
}

/* ------------------------------------------------------------------ */
/*  Lazy library loading (three + GLTF + Draco + OrbitControls)         */
/* ------------------------------------------------------------------ */
let libsPromise: Promise<ThreeLibs> | null = null;

function loadThreeLibs(): Promise<ThreeLibs> {
  if (!libsPromise) {
    libsPromise = Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
      .then(([three, gltf, draco, orbit, room]) => {
        T = three;
        return {
          GLTFLoader: gltf.GLTFLoader,
          DRACOLoader: draco.DRACOLoader,
          OrbitControls: orbit.OrbitControls,
          RoomEnvironment: room.RoomEnvironment,
        };
      })
      .catch((error) => {
        libsPromise = null; // allow a retry on the next mount
        throw error;
      });
  }
  return libsPromise;
}

/* ------------------------------------------------------------------ */
/*  Model cache: download + parse the GLB once per browser session      */
/* ------------------------------------------------------------------ */
let cachedModelPromise: Promise<LoadedData> | null = null;
let cachedModelData: LoadedData | null = null;

// Status broadcast so a remount (e.g. React StrictMode in dev) still sees progress
type StatusFn = (message: string) => void;
const statusListeners = new Set<StatusFn>();
let lastStatus = 'Loading 3D model';
const emitStatus = (message: string) => {
  lastStatus = message;
  statusListeners.forEach((fn) => fn(message));
};

// Resolve after the browser has had a chance to paint, so status text updates show
// before a long synchronous step.
const nextPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

function asArray<T>(m: T | T[]): T[] {
  return Array.isArray(m) ? m : [m];
}

const matsOf = (m: THREE.Mesh): StdMat[] => asArray(m.material) as StdMat[];

function labelOf(object: THREE.Object3D, modelRoot: THREE.Object3D | null): string {
  if (object.userData.label !== undefined) return object.userData.label as string;
  const names: string[] = [];
  for (let o: THREE.Object3D | null = object; o && o !== modelRoot; o = o.parent) {
    names.push(o.name, (o.userData?.name as string) || '');
  }
  object.userData.label = names.join(' ');
  return object.userData.label as string;
}

const matches = (object: THREE.Object3D, matchers: (RegExp | string)[], modelRoot: THREE.Object3D | null) =>
  matchers.some((m) => (m instanceof RegExp ? m.test(labelOf(object, modelRoot)) : labelOf(object, modelRoot).includes(m)));

const SILK_RE = /silk|legend/i;
const MASK_RE = /solder\s*_?mask|soldermask|(^|[^a-z])mask/i;
const COPPER_RE = /copper|gold|enig|hasl|via|(^|[^a-z])pads?($|[^a-z])/i;
const BOARD_LAYER_RE = /(^|\s)board_(silkscreen|soldermask|copper|pad|via|pcb)/i;

function styleSilkscreen(mat: StdMat) {
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
  mat.side = T.DoubleSide;
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -1;
  mat.needsUpdate = true;
}

function stylePcb(mat: StdMat) {
  mat.map = null;
  mat.vertexColors = false;
  mat.color.set(CONFIG.pcbColor);
  mat.roughness = 0.38;
  mat.metalness = 0;
  mat.envMapIntensity = CONFIG.envIntensity;
  mat.transparent = true;
  mat.opacity = CONFIG.pcbOpacity;
  mat.depthWrite = false;
  mat.needsUpdate = true;
}

const isGreenish = (m: StdMat) => m.color && m.color.g > m.color.r * 1.05 && m.color.g > m.color.b * 1.05;
const isPartRole = (m: THREE.Mesh) => m.userData.role === 'part';

function resolvePart(
  key: string,
  matchers: (RegExp | string)[],
  meshes: THREE.Mesh[],
  modelRoot: THREE.Object3D,
  board: Board
): THREE.Mesh[] {
  const names = CONFIG.partNames[key] || [];
  if (names.length) {
    const out = new Set<THREE.Mesh>();
    modelRoot.traverse((node) => {
      const hit = names.some((n) =>
        n instanceof RegExp ? n.test(node.name) : n.toLowerCase() === node.name.toLowerCase()
      );
      if (hit) {
        node.traverse((c) => {
          if ((c as THREE.Mesh).isMesh && isPartRole(c as THREE.Mesh)) out.add(c as THREE.Mesh);
        });
      }
    });
    if (out.size) return Array.from(out);
  }

  const seeds = meshes.filter(
    (m) => m.userData.role !== 'mask' && m.userData.role !== 'silk' && matches(m, matchers, modelRoot)
  );
  if (!seeds.length) return [];

  const side = seeds.reduce((sum, m) => sum + (m.userData.side as number), 0) >= 0 ? 1 : -1;
  const box = new T.Box3();
  seeds.forEach((m) => box.union(m.userData.box as THREE.Box3));
  const margin = board.max * 0.01;
  box.min.x -= margin;
  box.min.y -= margin;
  box.max.x += margin;
  box.max.y += margin;
  const fp = box.getSize(new T.Vector3());
  const footprintArea = fp.x * fp.y;

  const out = new Set(seeds.filter(isPartRole));
  const c = new T.Vector3();
  meshes.forEach((m) => {
    if (!isPartRole(m) || m.userData.side !== side) return;
    (m.userData.box as THREE.Box3).getCenter(c);
    const inside = c.x >= box.min.x && c.x <= box.max.x && c.y >= box.min.y && c.y <= box.max.y;
    if (inside && (m.userData.area as number) >= footprintArea * 0.15) out.add(m);
  });
  return Array.from(out);
}

function prepareModel(
  model: THREE.Object3D,
  board: Board
): { componentMeshes: Record<string, THREE.Mesh[]>; meshes: THREE.Mesh[] } {
  model.updateMatrixWorld(true);
  const meshes: THREE.Mesh[] = [];
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });

  const flatLimit = board.d * 0.03;
  const unknownSpan: THREE.Mesh[] = [];
  let maskFound = false;

  meshes.forEach((mesh) => {
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone();
    const mats = matsOf(mesh);
    const label = `${labelOf(mesh, model)} ${mats.map((m) => m.name).join(' ')}`;
    const box = new T.Box3().setFromObject(mesh);
    const size = box.getSize(new T.Vector3());
    const spansBoard = size.x >= board.w * 0.6 && size.y >= board.h * 0.6;
    mesh.userData.box = box;
    mesh.userData.area = size.x * size.y;

    const flat = size.z <= flatLimit;
    const layerName = labelOf(mesh, model).match(BOARD_LAYER_RE);
    let role: Role;
    if (layerName) {
      const n = layerName[0].toLowerCase();
      role = n.includes('silk') ? 'silk' : n.includes('mask') ? 'mask' : 'copper';
    } else if (!spansBoard && !flat) {
      role = 'part';
    } else if (SILK_RE.test(label)) {
      role = 'silk';
    } else if (MASK_RE.test(label)) {
      role = 'mask';
    } else if (spansBoard) {
      if (COPPER_RE.test(label)) role = 'copper';
      else if (mats.some(isGreenish)) role = 'mask';
      else {
        role = 'copper';
        unknownSpan.push(mesh);
      }
    } else {
      role = 'copper';
    }

    if (role === 'mask') maskFound = true;
    mesh.userData.role = role;
    mesh.userData.small = !spansBoard;
  });

  if (!maskFound && unknownSpan.length) {
    unknownSpan.sort((a, b) => (b.userData.area as number) - (a.userData.area as number));
    unknownSpan[0].userData.role = 'mask';
  }

  meshes.forEach((mesh) => {
    const role = mesh.userData.role as Role;
    matsOf(mesh).forEach((m) => {
      if (role === 'silk') styleSilkscreen(m);
      else if (role === 'mask') stylePcb(m);
      else m.envMapIntensity = CONFIG.envIntensity;
    });
    mesh.renderOrder = role === 'silk' ? 2 : role === 'mask' ? 1 : 0;
  });

  const v = new T.Vector3();
  const maskMesh = meshes.find((m) => m.userData.role === 'mask');
  const pcbZ = maskMesh ? (maskMesh.userData.box as THREE.Box3).getCenter(v).z : 0;
  meshes.forEach((m) => {
    m.userData.side = (m.userData.box as THREE.Box3).getCenter(v).z >= pcbZ ? 1 : -1;
  });

  const componentMeshes: Record<string, THREE.Mesh[]> = {};
  Object.entries(componentMatchers).forEach(([key, matchers]) => {
    componentMeshes[key] = resolvePart(key, matchers, meshes, model, board);
  });

  return { componentMeshes, meshes };
}

/* ------------------------------------------------------------------ */
/*  Selection boxes (acid yellow/green bounding boxes from moovma)    */
/* ------------------------------------------------------------------ */
function splitByDistance(meshes: THREE.Mesh[], board: Board): THREE.Mesh[][] {
  const gap = board.max * CONFIG.clusterGap;
  const boxes = meshes.map((m) => (m.userData.box as THREE.Box3).clone().expandByScalar(gap));
  const parent = meshes.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < meshes.length; i++) {
    for (let j = i + 1; j < meshes.length; j++) {
      if (boxes[i].intersectsBox(boxes[j])) parent[find(i)] = find(j);
    }
  }
  const clusters = new Map<number, THREE.Mesh[]>();
  meshes.forEach((mesh, i) => {
    const r = find(i);
    if (!clusters.has(r)) clusters.set(r, []);
    clusters.get(r)!.push(mesh);
  });
  return Array.from(clusters.values());
}

function groupsFor(
  key: string,
  modelRoot: THREE.Object3D,
  componentMeshes: Record<string, THREE.Mesh[]>,
  board: Board
): THREE.Mesh[][] {
  const names = CONFIG.partNames[key] || [];
  const groups: THREE.Mesh[][] = [];
  names.forEach((n) => {
    const set = new Set<THREE.Mesh>();
    modelRoot.traverse((node) => {
      const hit = n instanceof RegExp ? n.test(node.name) : n.toLowerCase() === node.name.toLowerCase();
      if (hit) {
        node.traverse((c) => {
          if ((c as THREE.Mesh).isMesh && isPartRole(c as THREE.Mesh)) set.add(c as THREE.Mesh);
        });
      }
    });
    if (set.size) groups.push(Array.from(set));
  });
  if (!groups.length && (componentMeshes[key] || []).length) groups.push(componentMeshes[key]);
  return groups.flatMap((meshes) => splitByDistance(meshes, board));
}

function createSelectionBox(
  component: string,
  modelRoot: THREE.Object3D,
  componentMeshes: Record<string, THREE.Mesh[]>,
  board: Board
): THREE.Group {
  modelRoot.updateWorldMatrix(true, true);
  const inv = new T.Matrix4().copy(modelRoot.matrixWorld).invert();
  const m = new T.Matrix4();
  const tmp = new T.Box3();
  const pad = board.max * CONFIG.boxPadding * 2;
  const selectionGroup = new T.Group();

  groupsFor(component, modelRoot, componentMeshes, board).forEach((meshes) => {
    const box = new T.Box3();
    meshes.forEach((mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      m.multiplyMatrices(inv, mesh.matrixWorld);
      tmp.copy(mesh.geometry.boundingBox!).applyMatrix4(m);
      box.union(tmp);
    });
    if (box.isEmpty()) return;
    const size = box.getSize(new T.Vector3()).addScalar(pad);
    const center = box.getCenter(new T.Vector3());
    const cube = new T.BoxGeometry(size.x, size.y, size.z);

    const fill = new T.Mesh(
      cube,
      new T.MeshBasicMaterial({
        color: CONFIG.boxColor,
        transparent: true,
        opacity: CONFIG.boxFillOpacity,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      })
    );
    const edges = new T.LineSegments(
      new T.EdgesGeometry(cube),
      new T.LineBasicMaterial({
        color: CONFIG.boxColor,
        depthTest: false,
        toneMapped: false,
      })
    );
    [fill, edges].forEach((o) => {
      o.position.copy(center);
      o.renderOrder = 10;
      o.userData.isSelection = true;
      selectionGroup.add(o);
    });
  });

  return selectionGroup;
}

/* ------------------------------------------------------------------ */
/*  Singleton loader: fetches + parses the compressed GLB once          */
/* ------------------------------------------------------------------ */
function getOrLoadModel(libs: ThreeLibs): Promise<LoadedData> {
  if (cachedModelData) return Promise.resolve(cachedModelData);
  if (cachedModelPromise) return cachedModelPromise;

  cachedModelPromise = (async () => {
    const draco = new libs.DRACOLoader();
    draco.setDecoderPath(CONFIG.dracoDecoderPath);
    const loader = new libs.GLTFLoader();
    loader.setDRACOLoader(draco);

    try {
      emitStatus('Loading 3D model');
      const gltf = await loader.loadAsync(CONFIG.modelUrl, (xhr) => {
        if (xhr.total > 0) {
          emitStatus(`Loading 3D model ${Math.min(Math.round((xhr.loaded / xhr.total) * 100), 99)}%`);
        }
      });

      emitStatus('Preparing model');
      await nextPaint();

      const model = gltf.scene;

      // Board centre -> pivot, so it sits and turns around 0,0,0
      const raw = new T.Box3().setFromObject(model);
      model.position.sub(raw.getCenter(new T.Vector3()));

      // Measure board bounds in KiCad Z-up orientation
      const tempGroup = new T.Group();
      tempGroup.rotation.x = Math.PI / 2;
      tempGroup.add(model);
      tempGroup.updateMatrixWorld(true);
      const size = new T.Box3().setFromObject(tempGroup).getSize(new T.Vector3());
      const board: Board = { w: size.x, h: size.y, d: size.z, max: Math.max(size.x, size.y, size.z) };
      tempGroup.remove(model);

      const prepared = prepareModel(model, board);
      cachedModelData = { model, board, componentMeshes: prepared.componentMeshes };
      return cachedModelData;
    } catch (error) {
      cachedModelPromise = null; // allow a retry on the next mount
      throw error;
    } finally {
      draco.dispose(); // decoding is finished, release the decoder workers
    }
  })();

  return cachedModelPromise;
}

/* ------------------------------------------------------------------ */
/*  Scene: renderer, OrbitControls, animation loop (imperative part)    */
/* ------------------------------------------------------------------ */
interface ViewerCallbacks {
  onStatus: (message: string) => void;
  onReady: () => void;
  onError: (message: string) => void;
  getInitialKey: () => string;
}

interface ViewerHandle {
  focusComponent: (key: string) => void;
  dispose: () => void;
}

function createViewer(container: HTMLDivElement, libs: ThreeLibs, cb: ViewerCallbacks): ViewerHandle {
  let disposed = false;
  let running = false;
  let animId = 0;
  let modelRoot: THREE.Object3D | null = null;
  let board: Board = { w: 1, h: 1, d: 0.1, max: 1 };
  let componentMeshesMap: Record<string, THREE.Mesh[]> = {};
  let selectionBox: THREE.Group | null = null;
  let targetFlip = 0;

  /* Renderer matching moovma.github.io */
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    console.warn('[ThreeViewer] WebGL init error:', e);
    cb.onError('3D preview needs WebGL');
    return { focusComponent: () => {}, dispose: () => {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NoToneMapping;
  renderer.setSize(container.clientWidth || 600, container.clientHeight || 520);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  const el = renderer.domElement;

  /* Scene, camera & lights */
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.001, 100);
  camera.up.set(0, 1, 0);
  camera.position.set(0, 0, 5); // provisional, set from the board size once the model is mounted

  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new libs.RoomEnvironment();
  const roomTex = pmrem.fromScene(envScene, 0.04).texture;
  scene.environment = roomTex;
  pmrem.dispose();
  envScene.dispose();

  scene.add(new T.AmbientLight(0xffffff, 0.1));
  const keyLight = new T.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(2, 4, 5);
  scene.add(keyLight);
  const rimLight = new T.DirectionalLight(0x9fd0ff, 0.6);
  rimLight.position.set(-3, 1, -2);
  scene.add(rimLight);

  /* Pivot hierarchy: floatGroup -> flipGroup -> orientGroup -> model */
  const floatGroup = new T.Group();
  const flipGroup = new T.Group();
  const orientGroup = new T.Group();
  orientGroup.rotation.x = Math.PI / 2;
  floatGroup.add(flipGroup);
  flipGroup.add(orientGroup);
  scene.add(floatGroup);

  /* OrbitControls: drag to rotate, no zoom/pan (so the page can still scroll) */
  const controls = new libs.OrbitControls(camera, el);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.7;
  controls.minPolarAngle = Math.PI / 2 - CONFIG.maxTilt;
  controls.maxPolarAngle = Math.PI / 2 + CONFIG.maxTilt;
  controls.target.set(0, 0, 0);
  // OrbitControls sets touch-action:none, which would block vertical page scroll when a finger
  // starts on the canvas. pan-y keeps vertical swipes for the page; horizontal swipes rotate.
  el.style.touchAction = 'pan-y';

  /* Camera frustum from board size (matches original moovma.github.io) */
  const resize = () => {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    const aspect = width / height;
    const half = Math.max(board.h / 2, board.w / 2 / aspect) * CONFIG.zoomOut;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const clearHighlight = () => {
    if (selectionBox && modelRoot) {
      modelRoot.remove(selectionBox);
      selectionBox.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) asArray(m.material).forEach((mat) => mat.dispose());
      });
    }
    selectionBox = null;
  };

  const focusComponent = (key: string) => {
    if (!modelRoot) return;
    targetFlip = componentView[key]?.flip ?? 0;
    clearHighlight();
    selectionBox = createSelectionBox(key, modelRoot, componentMeshesMap, board);
    modelRoot.add(selectionBox);
  };

  /* Mount the (cached) model into our scene */
  const mountModel = (data: LoadedData) => {
    if (disposed) return;
    modelRoot = data.model;
    board = data.board;
    componentMeshesMap = data.componentMeshes;

    orientGroup.add(modelRoot);
    scene.updateMatrixWorld(true);

    const distance = board.max * 4;
    camera.position.set(0, 0, distance);
    camera.near = distance - board.max * 2;
    camera.far = distance + board.max * 2;
    camera.lookAt(0, 0, 0);

    resize();
    controls.update();
    cb.onStatus('3D model ready');
    cb.onReady();
    focusComponent(cb.getInitialKey());
  };

  /* Animation loop: only runs while the viewer is on screen */
  const clock = new T.Clock();
  const animate = () => {
    if (!running) return;
    animId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (modelRoot) {
      const k = 1 - Math.exp(-dt * CONFIG.flipSpeed);
      flipGroup.rotation.y += (targetFlip - flipGroup.rotation.y) * k;

      floatGroup.position.set(0, Math.sin(t * 1.4) * board.max * CONFIG.hoverHeight, 0);
      floatGroup.rotation.set(
        Math.sin(t * 0.9) * CONFIG.swayAmount,
        Math.sin(t * 0.7) * CONFIG.swayAmount * 1.3,
        0
      );
    }
    controls.update(); // required for damping
    renderer.render(scene, camera);
  };
  const start = () => {
    if (running || disposed) return;
    running = true;
    clock.getDelta(); // reset so the first frame after a pause doesn't jump
    animId = requestAnimationFrame(animate);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(animId);
  };

  let visibilityObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    visibilityObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => (entry.isIntersecting ? start() : stop())),
      { rootMargin: '120px 0px' }
    );
    visibilityObserver.observe(container);
  } else {
    start();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  /* Kick off (or attach to) the model load */
  const handleStatus: StatusFn = (message) => {
    if (!disposed) cb.onStatus(message);
  };
  if (cachedModelData) {
    mountModel(cachedModelData);
  } else {
    statusListeners.add(handleStatus);
    handleStatus(lastStatus);
    getOrLoadModel(libs)
      .then((data) => mountModel(data))
      .catch((error) => {
        console.error('[ThreeViewer] GLB failed to load', error);
        if (!disposed) cb.onError('3D model unavailable');
      });
  }

  return {
    focusComponent,
    dispose() {
      disposed = true;
      stop();
      statusListeners.delete(handleStatus);
      visibilityObserver?.disconnect();
      resizeObserver.disconnect();
      controls.dispose();
      clearHighlight();

      // Detach the cached model so its meshes survive for the next mount
      if (modelRoot) {
        orientGroup.remove(modelRoot);
        modelRoot = null;
      }

      scene.environment = null;
      roomTex.dispose();

      // Free the WebGL context right away to avoid hitting the browser's context limit
      renderer.forceContextLoss();
      renderer.dispose();
      if (el.parentNode === container) container.removeChild(el);
    },
  };
}

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */
export interface ThreeViewerProps {
  /** Fires whenever `ready` changes. `true` once the model is mounted and rendering. */
  onReadyChange?: (ready: boolean) => void;
}

export default function ThreeViewer({ onReadyChange }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeComponent, setActiveComponent] = useState<string>('mcu');
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading 3D model');

  const pendingKeyRef = useRef<string>('mcu');
  const focusComponentRef = useRef<((key: string) => void) | null>(null);
  const onReadyChangeRef = useRef(onReadyChange);

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  useEffect(() => {
    onReadyChangeRef.current?.(ready);
  }, [ready]);

  const selectComponent = useCallback((key: string) => {
    setActiveComponent(key);
    pendingKeyRef.current = key;
    focusComponentRef.current?.(key);
  }, []);

  useEffect(() => {
    const handleComponentChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) selectComponent(detail);
    };
    window.addEventListener('board-component-change', handleComponentChange);
    return () => window.removeEventListener('board-component-change', handleComponentChange);
  }, [selectComponent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let viewer: ViewerHandle | null = null;

    const fail = (message: string) => {
      if (disposed) return;
      setLoadFailed(true);
      setStatusMessage(message);
    };

    loadThreeLibs()
      .then((libs) => {
        if (disposed) return;
        viewer = createViewer(container, libs, {
          onStatus: (message) => {
            if (!disposed) setStatusMessage(message);
          },
          onReady: () => {
            if (!disposed) setReady(true);
          },
          onError: fail,
          getInitialKey: () => pendingKeyRef.current,
        });
        focusComponentRef.current = viewer.focusComponent;
      })
      .catch((error) => {
        console.error('[ThreeViewer] three.js failed to load', error);
        fail('3D viewer unavailable');
      });

    return () => {
      disposed = true;
      focusComponentRef.current = null;
      viewer?.dispose();
      viewer = null;
    };
  }, []);

  return (
    <section className="anatomy-section" id="anatomy" data-ready={ready}>
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>01 / 02</span>
          <span>Board anatomy</span>
        </div>
        <div className="anatomy-heading">
          <h2 className="reveal">
            Meet the parts<br />that make <em>Elyssa.</em>
          </h2>
          <p className="reveal delay-one">
            Rotate the board and inspect the components that matter. Passive parts stay quiet so the real architecture can come forward.
          </p>
        </div>
        <div className="anatomy-layout anatomy-scroll">
          <div className="model-frame model-sticky reveal">
            <div className="model-status" role="status">
              <span className={`status-dot${ready ? ' is-ready' : ' is-loading'}`}></span>
              <span>{statusMessage}</span>
            </div>

            {!ready && !loadFailed && (
              <div className="model-placeholder-loader">
                <div className="viewer-radar-loader">
                  <div className="radar-ring"></div>
                  <div className="radar-sweep"></div>
                  <div className="radar-core"></div>
                </div>
                <span className="loader-status-text">{statusMessage}</span>
              </div>
            )}

            <div id="board-viewer" ref={containerRef}></div>

            <div className="model-hint">
              Drag to rotate <span>·</span> Click a component
            </div>
            <div className="axis-legend">
              <span className="axis-x">X</span>
              <span className="axis-y">Y</span>
              <span className="axis-z">Z</span>
            </div>
          </div>

          <div className="component-story">
            {COMPONENTS.map((item) => (
              <article
                key={item.id}
                className={`story-step${activeComponent === item.id ? ' is-active' : ''}`}
                onClick={() => selectComponent(item.id)}
                data-component={item.id}
              >
                <span className="story-number">{item.num}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
