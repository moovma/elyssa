'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------ */
/*  Settings from docs/three-viewer.js (original moovma.github.io)      */
/* ------------------------------------------------------------------ */
const CONFIG = {
  modelUrl: '/elyssa_3d/elyssa.glb',
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
  flipAxis: 'y' as const, // 'y' = turn like a page

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

/* Module-level singleton cache: Load & parse the 30MB CAD model only once per browser session */
let cachedModelPromise: Promise<LoadedData> | null = null;
let cachedModelData: LoadedData | null = null;

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
  mat.side = THREE.DoubleSide;
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
  const box = new THREE.Box3();
  seeds.forEach((m) => box.union(m.userData.box as THREE.Box3));
  const margin = board.max * 0.01;
  box.min.x -= margin;
  box.min.y -= margin;
  box.max.x += margin;
  box.max.y += margin;
  const fp = box.getSize(new THREE.Vector3());
  const footprintArea = fp.x * fp.y;

  const out = new Set(seeds.filter(isPartRole));
  const c = new THREE.Vector3();
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
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
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

  const v = new THREE.Vector3();
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
  const inv = new THREE.Matrix4().copy(modelRoot.matrixWorld).invert();
  const m = new THREE.Matrix4();
  const tmp = new THREE.Box3();
  const pad = board.max * CONFIG.boxPadding * 2;
  const selectionGroup = new THREE.Group();

  groupsFor(component, modelRoot, componentMeshes, board).forEach((meshes) => {
    const box = new THREE.Box3();
    meshes.forEach((mesh) => {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      m.multiplyMatrices(inv, mesh.matrixWorld);
      tmp.copy(mesh.geometry.boundingBox!).applyMatrix4(m);
      box.union(tmp);
    });
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3()).addScalar(pad);
    const center = box.getCenter(new THREE.Vector3());
    const cube = new THREE.BoxGeometry(size.x, size.y, size.z);

    const fill = new THREE.Mesh(
      cube,
      new THREE.MeshBasicMaterial({
        color: CONFIG.boxColor,
        transparent: true,
        opacity: CONFIG.boxFillOpacity,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      })
    );
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cube),
      new THREE.LineBasicMaterial({
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
/*  Singleton Loader (fetches 30MB once across all mounts/pages)       */
/* ------------------------------------------------------------------ */
function getOrLoadModel(onProgress?: (percent: number) => void): Promise<LoadedData> {
  if (cachedModelData) {
    return Promise.resolve(cachedModelData);
  }
  if (cachedModelPromise) {
    return cachedModelPromise;
  }

  cachedModelPromise = new Promise<LoadedData>((resolve, reject) => {
    new GLTFLoader().load(
      CONFIG.modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Board centre -> pivot, so it sits and turns around 0,0,0
        const raw = new THREE.Box3().setFromObject(model);
        model.position.sub(raw.getCenter(new THREE.Vector3()));

        // Measure board bounds in KiCad Z-up orientation
        const tempGroup = new THREE.Group();
        tempGroup.rotation.x = Math.PI / 2;
        tempGroup.add(model);
        tempGroup.updateMatrixWorld(true);
        const size = new THREE.Box3().setFromObject(tempGroup).getSize(new THREE.Vector3());
        const board: Board = { w: size.x, h: size.y, d: size.z, max: Math.max(size.x, size.y, size.z) };
        tempGroup.remove(model);

        const prepared = prepareModel(model, board);
        cachedModelData = {
          model,
          board,
          componentMeshes: prepared.componentMeshes,
        };
        resolve(cachedModelData);
      },
      (xhr) => {
        if (xhr.total > 0 && onProgress) {
          const p = Math.min(Math.round((xhr.loaded / xhr.total) * 100), 99);
          onProgress(p);
        }
      },
      (error) => {
        cachedModelPromise = null;
        reject(error);
      }
    );
  });

  return cachedModelPromise;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function ThreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeComponent, setActiveComponent] = useState<string>('mcu');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading 3D model');

  const pendingKeyRef = useRef<string>('mcu');
  const targetFlipRef = useRef(0);
  const userRotationYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const selectionBoxRef = useRef<THREE.Group | null>(null);
  const focusComponentRef = useRef<((key: string) => void) | null>(null);

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
    let animId = 0;
    let modelRoot: THREE.Object3D | null = null;
    let board: Board = { w: 1, h: 1, d: 0.1, max: 1 };
    let componentMeshesMap: Record<string, THREE.Mesh[]> = {};

    /* Renderer matching moovma.github.io */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL init error:', e);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setSize(container.clientWidth || 600, container.clientHeight || 520);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    const el = renderer.domElement;

    /* Scene, Camera & Lights */
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 100);
    camera.up.set(0, 1, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = roomTex;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x9fd0ff, 0.6);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    /* Pivot Hierarchy: floatGroup -> flipGroup -> orientGroup -> model */
    const floatGroup = new THREE.Group();
    const flipGroup = new THREE.Group();
    const orientGroup = new THREE.Group();
    orientGroup.rotation.x = Math.PI / 2;
    floatGroup.add(flipGroup);
    flipGroup.add(orientGroup);
    scene.add(floatGroup);

    /* Camera resize logic matching original moovma.github.io */
    const resize = () => {
      if (!container || !renderer) return;
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
      if (selectionBoxRef.current && modelRoot) {
        modelRoot.remove(selectionBoxRef.current);
        selectionBoxRef.current.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) asArray(m.material).forEach((mat) => mat.dispose());
        });
        selectionBoxRef.current = null;
      }
    };

    const focusComponent = (key: string) => {
      if (!modelRoot) return;
      const target = componentView[key]?.flip ?? 0;
      targetFlipRef.current = target;
      clearHighlight();
      const newBox = createSelectionBox(key, modelRoot, componentMeshesMap, board);
      selectionBoxRef.current = newBox;
      modelRoot.add(newBox);
    };
    focusComponentRef.current = focusComponent;

    /* Mount the cached model into our scene */
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
      setModelLoaded(true);
      setStatusMessage('3D model ready');

      // Process any pending selection buffered while downloading
      const initialKey = pendingKeyRef.current || activeComponent || 'mcu';
      focusComponent(initialKey);
    };

    /* Start or attach to the singleton loader */
    const loadModel = () => {
      if (cachedModelData) {
        mountModel(cachedModelData);
        return;
      }

      setStatusMessage('Loading 3D model');
      getOrLoadModel((p) => {
        if (!disposed) setStatusMessage(`Loading 3D model ${p}%`);
      })
        .then((data) => {
          if (!disposed) mountModel(data);
        })
        .catch((error) => {
          console.error('[ThreeViewer] GLB failed to load', error);
          if (!disposed) {
            setLoadFailed(true);
            setStatusMessage('3D model unavailable');
          }
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) loadModel();
        });
      },
      { rootMargin: '160px 0px 160px 0px', threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    /* User Interaction: Drag to rotate */
    const onDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseXRef.current;
      userRotationYRef.current += dx * 0.01;
      prevMouseXRef.current = e.clientX;
    };
    const onUp = () => {
      isDraggingRef.current = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseXRef.current = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseXRef.current;
      userRotationYRef.current += dx * 0.01;
      prevMouseXRef.current = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    /* Animation Loop matching original moovma.github.io */
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (modelRoot) {
        const k = 1 - Math.exp(-dt * CONFIG.flipSpeed);
        const target = targetFlipRef.current + userRotationYRef.current;
        flipGroup.rotation.y += (target - flipGroup.rotation.y) * k;

        floatGroup.position.set(0, Math.sin(t * 1.4) * board.max * CONFIG.hoverHeight, 0);
        floatGroup.rotation.set(
          Math.sin(t * 0.9) * CONFIG.swayAmount,
          Math.sin(t * 0.7) * CONFIG.swayAmount * 1.3,
          0
        );
      }
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      disposed = true;
      focusComponentRef.current = null;
      cancelAnimationFrame(animId);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      clearHighlight();

      // Detach cached model from the scene so its meshes are preserved for the next mount
      if (modelRoot) {
        orientGroup.remove(modelRoot);
        modelRoot = null;
      }

      roomTex.dispose();

      // Free WebGL context immediately to prevent context exhaustion in browser
      renderer.forceContextLoss();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <section className="anatomy-section" id="anatomy" ref={sectionRef}>
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
            <div className="model-status">
              <span className={`status-dot${modelLoaded ? ' is-ready' : ' is-loading'}`}></span>
              <span>{statusMessage}</span>
            </div>

            {!modelLoaded && !loadFailed && (
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
