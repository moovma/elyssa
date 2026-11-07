'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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

export default function ThreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeComponent, setActiveComponent] = useState<string>('mcu');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Loading 3D model');

  const flipGroupRef = useRef<THREE.Group | null>(null);
  const floatGroupRef = useRef<THREE.Group | null>(null);
  const targetFlipRef = useRef(0);
  const userRotationYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const componentMeshesRef = useRef<{ [key: string]: THREE.Mesh[] }>({});
  const selectionBoxesRef = useRef<THREE.Box3Helper[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const hasStartedRef = useRef(false);

  const selectComponent = useCallback((key: string) => {
    setActiveComponent(key);
    const comp = COMPONENTS.find((c) => c.id === key);
    if (comp) targetFlipRef.current = comp.flip;

    const meshes = componentMeshesRef.current[key] || [];
    if (sceneRef.current) {
      selectionBoxesRef.current.forEach((h) => {
        sceneRef.current?.remove(h);
        h.dispose();
      });
      selectionBoxesRef.current = [];
      meshes.forEach((mesh) => {
        mesh.geometry.computeBoundingBox();
        const box = new THREE.Box3().setFromObject(mesh);
        const helper = new THREE.Box3Helper(box, new THREE.Color(0xccff00));
        sceneRef.current?.add(helper);
        selectionBoxesRef.current.push(helper);
      });
    }
  }, []);

  useEffect(() => {
    const handleComponentChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        selectComponent(customEvent.detail);
      }
    };
    window.addEventListener('board-component-change', handleComponentChange);
    return () => {
      window.removeEventListener('board-component-change', handleComponentChange);
    };
  }, [selectComponent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let animId: number;
    let isVisible = true;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;
    const aspect = width / height;

    scene = new THREE.Scene();
    sceneRef.current = scene;

    camera = new THREE.OrthographicCamera(-1 * aspect, 1 * aspect, 1, -1, 0.001, 100);
    camera.position.set(0, 0, 5);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init error:', e);
      return;
    }

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fd0ff, 0.6);
    fill.position.set(-3, 1, -2);
    scene.add(fill);

    const floatGroup = new THREE.Group();
    const flipGroup = new THREE.Group();
    const orientGroup = new THREE.Group();
    orientGroup.rotation.x = Math.PI / 2;
    floatGroup.add(flipGroup);
    flipGroup.add(orientGroup);
    scene.add(floatGroup);
    flipGroupRef.current = flipGroup;
    floatGroupRef.current = floatGroup;

    const matchers: { [k: string]: RegExp[] } = {
      mcu: [/U1_QFN-56/i, /U1\b/i, /ESP32/i],
      imu: [/U2_LGA-14/i, /U2\b/i, /LSM6/i],
      bms: [/U13_MSOP-10/i, /U13\b/i, /BQ24/i],
      buck: [/U9_SOT-23-5/i, /U9\b/i, /TPS/i],
      rgb: [/U4_LED-ARRAY/i, /D12_/i, /D15_/i, /D16_/i, /D17_/i, /LED/i],
      sd: [/NAUO1_TF-01A/i, /TF-01A/i, /microSD/i, /SD/i],
    };

    const loadModel = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      setStatusMessage('Loading 3D model');

      const loader = new GLTFLoader();
      loader.load(
        '/elyssa_3d/elyssa-compressed.glb',
        (gltf) => {
          const model = gltf.scene;
          const bbox = new THREE.Box3().setFromObject(model);
          const center = bbox.getCenter(new THREE.Vector3());
          const size = bbox.getSize(new THREE.Vector3());
          model.position.sub(center);
          orientGroup.add(model);
          const maxDim = Math.max(size.x, size.y, size.z);
          const half = (maxDim / 2) * 1.35;
          camera.left = -half * aspect;
          camera.right = half * aspect;
          camera.top = half;
          camera.bottom = -half;
          camera.updateProjectionMatrix();

          const meshMap: { [k: string]: THREE.Mesh[] } = {
            mcu: [],
            imu: [],
            bms: [],
            buck: [],
            rgb: [],
            sd: [],
          };
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const name = mesh.name || mesh.parent?.name || '';
              for (const k of Object.keys(matchers)) {
                if (matchers[k].some((re) => re.test(name))) meshMap[k].push(mesh);
              }
            }
          });
          componentMeshesRef.current = meshMap;
          setModelLoaded(true);
          setLoadProgress(100);
          setStatusMessage('3D Model ready');
        },
        (xhr) => {
          if (xhr.total > 0) {
            const p = Math.min(Math.round((xhr.loaded / xhr.total) * 100), 99);
            setLoadProgress(p);
            setStatusMessage(`Loading 3D model ${p}%`);
          }
        },
        () => {
          setStatusMessage('3D model ready');
        }
      );
    };

    // Lazy load observer: only trigger when anatomy is near viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            isVisible = true;
            loadModel();
          } else {
            isVisible = false;
          }
        });
      },
      { rootMargin: '100px 0px 100px 0px', threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    // Mouse / touch controls
    const onDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      userRotationYRef.current += (e.clientX - prevMouseXRef.current) * 0.01;
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
      userRotationYRef.current += (e.touches[0].clientX - prevMouseXRef.current) * 0.012;
      prevMouseXRef.current = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const el = renderer.domElement;
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    // Render loop - stops when off-screen to save 100% GPU/CPU
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible || !renderer) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (flipGroupRef.current) {
        const cur = flipGroupRef.current.rotation.y;
        const tgt = targetFlipRef.current + userRotationYRef.current;
        flipGroupRef.current.rotation.y += (tgt - cur) * Math.min(dt * 5, 1);
      }
      if (floatGroupRef.current) {
        floatGroupRef.current.position.y = Math.sin(t * 1.4) * 0.035;
        floatGroupRef.current.rotation.y = Math.sin(t * 0.7) * 0.02;
        floatGroupRef.current.rotation.x = Math.sin(t * 0.5) * 0.015;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const a = w / h;
      camera.left = -1.2 * a;
      camera.right = 1.2 * a;
      camera.top = 1.2;
      camera.bottom = -1.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      renderer?.dispose();
      if (container) container.innerHTML = '';
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

            {!modelLoaded && (
              <div className="viewer-progress-overlay">
                <div className="viewer-progress-track">
                  <div
                    className="viewer-progress-fill"
                    style={{ width: `${Math.max(loadProgress, 12)}%` }}
                  ></div>
                </div>
                <span className="viewer-progress-text">{statusMessage}</span>
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
