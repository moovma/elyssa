'use client';

/**
 * One small 3D stage for the "How it compares" section (/elyssa).
 * - Elyssa: the real model (elyssa-compressed.glb, the same file the big viewer uses; the browser cache serves it).
 * - Arduino Uno R3 and ESP32-S3 DevKit: simple grayscale "clay" models built from boxes (illustrations, not to scale).
 * Every extra part a board needs for the chosen project floats around it as a small module, wired to the board.
 * Loaded with next/dynamic (ssr: false), so three.js only downloads when this section is near the screen.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { BoardKey } from '../lib/compare';

interface Props {
  kind: BoardKey;
  extras: number; // number of add-on modules to show (0 = ready)
  pulse: string; // changes when the project changes: the board does a small hop
}

const BOARD_SIZE = 1.9; // longest side of every board, in scene units
const MAX_EXTRAS = 6;
const ACID = 0xccff00;

/* ------------------------------------------------------------------ */
/*  Elyssa GLB: loaded once per page                                    */
/* ------------------------------------------------------------------ */
let elyssaPromise: Promise<THREE.Object3D> | null = null;

function tintPcbGreen(mat: THREE.MeshStandardMaterial) {
  if (!mat.map) return;
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      {
        float mx = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        bool olive = mx > 0.03 && mx < 0.45 && diffuseColor.g >= diffuseColor.r * 0.95 && diffuseColor.g > diffuseColor.b * 1.12;
        if (olive) {
          vec3 green = vec3(0.0, 0.181, 0.041) * clamp(mx / 0.15, 0.55, 1.3);
          diffuseColor.rgb = mix(diffuseColor.rgb, green, 0.92);
        }
      }`
    );
  };
  mat.customProgramCacheKey = () => 'elyssa-pcb-green';
  mat.needsUpdate = true;
}

function loadElyssa(): Promise<THREE.Object3D> {
  if (elyssaPromise) return elyssaPromise;
  elyssaPromise = (async () => {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    try {
      const gltf = await loader.loadAsync('/elyssa_3d/elyssa-compressed.glb');
      const model = gltf.scene;
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => tintPcbGreen(mat as THREE.MeshStandardMaterial));
      });
      // centre + normalise on the PCB itself (the biggest flat mesh), not on the whole scene,
      // which can hold parts that stick out. The board lies flat in X/Z.
      model.updateMatrixWorld(true);
      let pcb: THREE.Box3 | null = null;
      let best = 0;
      model.traverse((o) => {
        if (!(o as THREE.Mesh).isMesh) return;
        const b = new THREE.Box3().setFromObject(o);
        const s = b.getSize(new THREE.Vector3());
        if (s.x * s.z > best && s.y < Math.min(s.x, s.z) * 0.2) {
          best = s.x * s.z;
          pcb = b;
        }
      });
      const box = pcb ?? new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      model.position.sub(centre);
      const wrap = new THREE.Group();
      wrap.add(model);
      wrap.scale.setScalar(BOARD_SIZE / Math.max(size.x, size.z));
      if (size.z > size.x) wrap.rotation.y = Math.PI / 2; // long side along X, like the other two boards
      const outer = new THREE.Group();
      outer.add(wrap);
      return outer;
    } catch (e) {
      elyssaPromise = null;
      throw e;
    } finally {
      draco.dispose();
    }
  })();
  return elyssaPromise;
}

/* ------------------------------------------------------------------ */
/*  Clay models (millimetres, PCB top at y = 0.8)                       */
/* ------------------------------------------------------------------ */
const std = (color: number, roughness = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

function addBox(g: THREE.Group, w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y + h / 2, z); // y = bottom of the part
  g.add(mesh);
  return mesh;
}
function addCyl(g: THREE.Group, r: number, h: number, m: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), m);
  mesh.position.set(x, y + h / 2, z);
  g.add(mesh);
}
function addPins(g: THREE.Group, m: THREE.Material, count: number, x0: number, z: number, y0: number, h: number) {
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.64, h, 0.64), m, count);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < count; i++) inst.setMatrixAt(i, mtx.makeTranslation(x0 + i * 2.54, y0 + h / 2, z));
  g.add(inst);
}

function buildUno(): THREE.Group {
  const g = new THREE.Group();
  const T = 0.8;
  const pcb = std(0xb4b4b4, 0.75), dark = std(0x2e2e2e, 0.55), mid = std(0x8a8a8a, 0.5);
  const metal = std(0xd2d2d2, 0.3, 0.85), light = std(0xededed, 0.5);
  addBox(g, 68.6, 1.6, 53.3, pcb, 0, -0.8, 0);
  addBox(g, 16, 11, 12, metal, -30.5, T, -14); // USB-B
  addBox(g, 14, 11, 9, dark, -29.5, T, 17); // barrel jack
  addBox(g, 41, 8.5, 2.5, dark, 11, T, -24.4); // digital header
  addBox(g, 20, 8.5, 2.5, dark, 1, T, 24.4); // power header
  addBox(g, 15, 8.5, 2.5, dark, 22, T, 24.4); // analog header
  addBox(g, 37, 1, 10, mid, 12, T, 11); // DIP socket
  addBox(g, 35, 3.4, 7.6, dark, 12, T + 1, 11); // ATmega328P
  addBox(g, 6, 1.2, 6, dark, -14, T, -12); // USB chip
  addBox(g, 11, 3.5, 4.5, metal, -6, T, 2); // crystal
  addBox(g, 7, 2.6, 5, dark, -21, T, 4); // regulator
  addBox(g, 6, 3.2, 6, light, -27, T, -25 + 3.5); // reset button
  addCyl(g, 3, 7, mid, -19, T, 18);
  addCyl(g, 3, 7, mid, -12, T, 18);
  addBox(g, 5, 8.5, 7.6, dark, 31.5, T, 8); // ICSP
  addBox(g, 3, 1, 1.6, light, -2, T, -16); // LED "L"
  g.scale.setScalar(BOARD_SIZE / 68.6);
  return g;
}

function buildDevkit(): THREE.Group {
  const g = new THREE.Group();
  const T = 0.8;
  const pcb = std(0x3c3c3c, 0.7), dark = std(0x1f1f1f, 0.6), mid = std(0x9a9a9a, 0.5);
  const metal = std(0xd8d8d8, 0.28, 0.9), light = std(0xf2f2f2, 0.45);
  addBox(g, 69, 1.6, 25.4, pcb, 0, -0.8, 0);
  addBox(g, 25.5, 0.8, 18, mid, 22.5, T, 0); // module board (antenna end)
  addBox(g, 17.6, 2.4, 16, metal, 19, T + 0.8, 0); // module shield
  addBox(g, 9, 3.2, 7.5, metal, -31, T, 6.2); // USB 1
  addBox(g, 9, 3.2, 7.5, metal, -31, T, -6.2); // USB 2
  addBox(g, 5, 1.5, 4, light, -23, T, 8.5); // buttons
  addBox(g, 5, 1.5, 4, light, -23, T, -8.5);
  addBox(g, 5, 1.2, 5, dark, -15, T, -3); // USB-UART chip
  addBox(g, 3, 1.2, 3, dark, -7, T, 5); // regulator
  addBox(g, 5, 1.6, 5, light, -2, T, -5); // RGB LED
  addBox(g, 56, 2.5, 2.5, dark, -6.3, -0.8 - 2.5, 11.43); // header plastic (under the board)
  addBox(g, 56, 2.5, 2.5, dark, -6.3, -0.8 - 2.5, -11.43);
  addPins(g, metal, 22, -6.3 - 26.67, 11.43, -9, 11.6);
  addPins(g, metal, 22, -6.3 - 26.67, -11.43, -9, 11.6);
  g.scale.setScalar(BOARD_SIZE / 69);
  return g;
}

/** A small breakout board: what you would have to buy and wire. */
function buildModule(mats: { pcb: THREE.Material; chip: THREE.Material; pin: THREE.Material }): THREE.Group {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.3), mats.pcb);
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.14), mats.chip);
  c.position.set(0.04, 0.04, 0);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.26), mats.pin);
  h.position.set(-0.17, 0.04, 0);
  g.add(p, c, h);
  return g;
}

function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const grd = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.28)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */
interface StageApi {
  setExtras: (n: number) => void;
  hop: () => void;
  dispose: () => void;
}

function createStage(container: HTMLDivElement, kind: BoardKey): StageApi {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    container.classList.add('is-failed');
    return { setExtras: () => {}, hop: () => {}, dispose: () => {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, kind === 'elyssa' ? 0.6 : 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2, 5, 3);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(26, 4 / 3, 0.1, 60);
  const camDir = new THREE.Vector3(0, 0.62, 0.78).normalize();

  // spin -> (board + modules + wires); hop moves everything up and down
  const hopGroup = new THREE.Group();
  const spin = new THREE.Group();
  spin.rotation.y = kind === 'uno' ? -0.5 : kind === 'devkit' ? -0.35 : -0.2;
  hopGroup.add(spin);
  scene.add(hopGroup);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 2.3),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.3;
  scene.add(shadow);

  // "ready" ring (brand acid), shown when the board needs nothing extra
  const ringMat = new THREE.MeshBasicMaterial({ color: ACID, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.16, 1.2, 96), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.28;
  scene.add(ring);

  let board: THREE.Object3D | null = null;
  if (kind === 'uno') board = buildUno();
  if (kind === 'devkit') board = buildDevkit();
  if (board) spin.add(board);
  let elyssa: THREE.Object3D | null = null;
  if (kind === 'elyssa') {
    loadElyssa()
      .then((m) => {
        if (disposed) return;
        elyssa = m;
        spin.add(m);
        container.classList.add('is-ready');
        wake();
      })
      .catch(() => container.classList.add('is-failed'));
  } else {
    container.classList.add('is-ready');
  }

  // add-on modules + wires
  const modMats = { pcb: std(0x9d9d9d, 0.7), chip: std(0x2a2a2a, 0.5), pin: std(0x555555, 0.5) };
  const wireMat = new THREE.LineBasicMaterial({ color: 0x8a8a8a, transparent: true, opacity: 0.9 });
  const angles = [-140, -40, 140, 40, -90, 90].map((a) => (a * Math.PI) / 180);
  const modules = angles.map((a, i) => {
    const mod = buildModule(modMats);
    const home = new THREE.Vector3(Math.cos(a) * 1.42, 0.38, Math.sin(a) * 1.0);
    mod.position.copy(home);
    mod.rotation.y = -a + Math.PI / 2;
    mod.scale.setScalar(0.0001);
    spin.add(mod);
    const end = new THREE.Vector3(Math.cos(a) * 0.55, 0.03, Math.sin(a) * 0.4);
    const mid = home.clone().lerp(end, 0.5);
    mid.y -= 0.12;
    const curve = new THREE.QuadraticBezierCurve3(home.clone().setY(home.y - 0.02), mid, end);
    const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)), wireMat.clone());
    wire.visible = false;
    spin.add(wire);
    return { mod, wire, home, s: 0, i };
  });

  let extras = 0;
  let changedAt = 0;
  let hopAt = -10;
  let ringFlashAt = -10;
  let dragging = false;
  let lastX = 0;
  let spinVel = 0;
  let disposed = false;
  let visible = false;
  let raf = 0;
  let last = performance.now();
  let settledFrames = 0;

  const resize = () => {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 220;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(1.32 / t, 1.78 / (t * camera.aspect));
    camera.position.copy(camDir).multiplyScalar(dist);
    camera.lookAt(0, 0.02, 0);
    camera.updateProjectionMatrix();
    wake();
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = now / 1000;
    let moving = false;

    if (!reduced && !dragging) spin.rotation.y += dt * 0.32 + spinVel;
    if (!dragging) spinVel *= 0.92;
    if (!reduced) moving = true;

    // hop on project change
    const hp = (t - hopAt) / 0.5;
    hopGroup.position.y = !reduced && hp >= 0 && hp < 1 ? Math.sin(hp * Math.PI) * 0.12 : 0;
    if (hp < 1) moving = true;

    // modules pop in/out one after another
    modules.forEach((m) => {
      const target = m.i < extras && t - changedAt > m.i * 0.09 ? 1 : 0;
      m.s += (target - m.s) * (reduced ? 1 : Math.min(1, dt * 9));
      if (Math.abs(target - m.s) > 0.002) moving = true;
      const bob = reduced ? 0 : Math.sin(t * 2 + m.i) * 0.025;
      m.mod.visible = m.s > 0.02;
      m.mod.scale.setScalar(Math.max(m.s, 0.0001));
      m.mod.position.y = m.home.y + bob;
      m.wire.visible = m.s > 0.6;
    });

    // ready ring: flash, then settle to a soft glow
    const ready = extras === 0;
    const fp = t - ringFlashAt;
    const flash = ready && fp >= 0 && fp < 1.2 ? (1 - fp / 1.2) * 0.7 : 0;
    const targetOpacity = ready ? 0.35 + flash : 0;
    ringMat.opacity += (targetOpacity - ringMat.opacity) * (reduced ? 1 : Math.min(1, dt * 8));
    const rs = 1 + flash * 0.12;
    ring.scale.set(rs, rs, rs);
    if (fp < 1.3) moving = true;

    renderer.render(scene, camera);
    settledFrames = moving ? 0 : settledFrames + 1;
    if (visible && settledFrames < 3) raf = requestAnimationFrame(frame);
  };

  function wake() {
    settledFrames = 0;
    if (!raf && visible && !disposed) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  // drag to turn the board (horizontal only, so vertical swipes still scroll the page)
  const el = renderer.domElement;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    el.setPointerCapture?.(e.pointerId);
    wake();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    spin.rotation.y += dx * 0.012;
    spinVel = dx * 0.0015;
    wake();
  };
  const onUp = () => {
    dragging = false;
    wake();
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    },
    { rootMargin: '80px' }
  );
  io.observe(container);
  resize();

  return {
    setExtras(n: number) {
      extras = Math.max(0, Math.min(MAX_EXTRAS, n));
      changedAt = performance.now() / 1000;
      if (extras === 0) ringFlashAt = changedAt + 0.2;
      wake();
    },
    hop() {
      hopAt = performance.now() / 1000;
      wake();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      if (elyssa) spin.remove(elyssa); // the GLB is shared: keep its geometry for a later mount
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        mats.forEach((mt) => {
          (mt as THREE.MeshBasicMaterial).map?.dispose();
          mt.dispose();
        });
      });
      scene.environment?.dispose();
      renderer.dispose();
      el.remove();
    },
  };
}

export default function CompareBoard3D({ kind, extras, pulse }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useRef<StageApi | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!ref.current) return;
    api.current = createStage(ref.current, kind);
    return () => {
      api.current?.dispose();
      api.current = null;
    };
  }, [kind]);

  useEffect(() => {
    api.current?.setExtras(extras);
  }, [extras]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    api.current?.hop();
  }, [pulse]);

  return <div ref={ref} className="cmp-canvas" aria-hidden="true" />;
}
