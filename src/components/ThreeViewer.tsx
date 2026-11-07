'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ComponentInfo {
  id: string;
  num: string;
  name: string;
  title: string;
  description: string;
  flip: number;
}

const COMPONENTS: ComponentInfo[] = [
  {
    id: 'mcu',
    num: '01',
    name: 'ESP32-S3FN8 MCU',
    title: 'ESP32-S3FN8 MCU',
    description: 'The board’s main compute: dual-core 240 MHz Xtensa LX7 processor with 2.4 GHz Wi-Fi and Bluetooth LE 5 for connected hardware projects.',
    flip: 0,
  },
  {
    id: 'imu',
    num: '02',
    name: '6-Axis IMU (LSM6DS3TR-C)',
    title: '6-Axis IMU',
    description: 'The LSM6DS3TR-C measures acceleration, rotation, and internal temperature on a dedicated I2C bus, configured for gestures and orientation.',
    flip: 0,
  },
  {
    id: 'bms',
    num: '03',
    name: 'LiPo / BMS (BQ24092)',
    title: 'LiPo / BMS Charger',
    description: 'Onboard Texas Instruments BQ24092 handles 1A Li-Ion/Li-Polymer charging, charging status reporting, and automatic power-path management.',
    flip: 0,
  },
  {
    id: 'buck',
    num: '04',
    name: 'Buck Converter',
    title: 'Buck Regulator Rail',
    description: 'A dedicated step-down converter delivers an efficient, stable 3.3V power rail, staying cool even during intense RF transmissions.',
    flip: 0,
  },
  {
    id: 'rgb',
    num: '05',
    name: 'RGB LED Array',
    title: 'RGB Indicator Array',
    description: 'Three independent LED channels give firmware immediate multi-color visual feedback: diagnostics, battery alerts, and system state.',
    flip: 0,
  },
  {
    id: 'sd',
    num: '06',
    name: 'microSD Socket',
    title: 'microSD Slot (Back)',
    description: 'Push-pull card socket on a dedicated hardware SPI bus. Selecting this component smoothly turns the board to inspect the reverse side.',
    flip: Math.PI,
  },
];

export default function ThreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeComponent, setActiveComponent] = useState<string>('mcu');
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing 3D viewer...');

  const modelRootRef = useRef<THREE.Group | null>(null);
  const flipGroupRef = useRef<THREE.Group | null>(null);
  const floatGroupRef = useRef<THREE.Group | null>(null);
  const targetFlipRef = useRef<number>(0);
  const userRotationYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);
  const componentMeshesRef = useRef<{ [key: string]: THREE.Mesh[] }>({});
  const selectionBoxesRef = useRef<THREE.Box3Helper[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const hasStartedLoadingRef = useRef<boolean>(false);

  // Switch component and flip board if needed
  const selectComponent = (key: string) => {
    setActiveComponent(key);
    const targetComp = COMPONENTS.find((c) => c.id === key);
    if (targetComp) {
      targetFlipRef.current = targetComp.flip;
    }

    // Highlight meshes
    const meshes = componentMeshesRef.current[key] || [];
    if (sceneRef.current) {
      // Clear old highlight boxes
      selectionBoxesRef.current.forEach((helper) => {
        sceneRef.current?.remove(helper);
        helper.dispose();
      });
      selectionBoxesRef.current = [];

      // Add highlight boxes
      if (meshes.length > 0) {
        meshes.forEach((mesh) => {
          mesh.geometry.computeBoundingBox();
          const box = new THREE.Box3();
          box.setFromObject(mesh);
          const helper = new THREE.Box3Helper(box, new THREE.Color(0xccff00));
          sceneRef.current?.add(helper);
          selectionBoxesRef.current.push(helper);
        });
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let animationFrameId: number;
    let isVisible = true;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;
    const aspect = width / height;

    scene = new THREE.Scene();
    sceneRef.current = scene;

    camera = new THREE.OrthographicCamera(-1 * aspect, 1 * aspect, 1, -1, 0.001, 100);
    camera.position.set(0, 0, 5);
    camera.up.set(0, 1, 0);

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

    // Environment map & lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(2, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fd0ff, 0.6);
    fillLight.position.set(-3, 1, -2);
    scene.add(fillLight);

    const floatGroup = new THREE.Group();
    const flipGroup = new THREE.Group();
    const orientGroup = new THREE.Group();
    orientGroup.rotation.x = Math.PI / 2;

    floatGroup.add(flipGroup);
    flipGroup.add(orientGroup);
    scene.add(floatGroup);

    flipGroupRef.current = flipGroup;
    floatGroupRef.current = floatGroup;

    // Component matcher patterns
    const matchers: { [k: string]: RegExp[] } = {
      mcu: [/U1_QFN-56/i, /U1\b/i, /ESP32/i],
      imu: [/U2_LGA-14/i, /U2\b/i, /LSM6/i],
      bms: [/U13_MSOP-10/i, /U13\b/i, /BQ24/i],
      buck: [/U9_SOT-23-5/i, /U9\b/i, /TPS/i],
      rgb: [/U4_LED-ARRAY/i, /D12_/i, /D15_/i, /D16_/i, /D17_/i, /LED/i],
      sd: [/NAUO1_TF-01A/i, /TF-01A/i, /microSD/i, /SD/i],
    };

    const loadModel = () => {
      if (hasStartedLoadingRef.current) return;
      hasStartedLoadingRef.current = true;
      setStatusMessage('Downloading 3D board...');

      const loader = new GLTFLoader();
      loader.load(
        '/elyssa_3d/elyssa-compressed.glb',
        (gltf) => {
          const model = gltf.scene;
          modelRootRef.current = model;

          const bbox = new THREE.Box3().setFromObject(model);
          const center = bbox.getCenter(new THREE.Vector3());
          const size = bbox.getSize(new THREE.Vector3());
          model.position.sub(center);
          orientGroup.add(model);

          const maxDim = Math.max(size.x, size.y, size.z);
          const zoomOut = 1.35;
          const half = (maxDim / 2) * zoomOut;
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
              const nodeName = mesh.name || mesh.parent?.name || '';
              for (const key of Object.keys(matchers)) {
                if (matchers[key].some((re) => re.test(nodeName))) {
                  meshMap[key].push(mesh);
                }
              }
            }
          });

          componentMeshesRef.current = meshMap;
          setModelLoaded(true);
          setLoadProgress(100);
          setStatusMessage('3D Board Interactive');
        },
        (xhr) => {
          if (xhr.total > 0) {
            const percent = Math.min(Math.round((xhr.loaded / xhr.total) * 100), 99);
            setLoadProgress(percent);
            setStatusMessage(`Loading 3D board: ${percent}%`);
          } else {
            const mb = (xhr.loaded / (1024 * 1024)).toFixed(1);
            setStatusMessage(`Streaming 3D model: ${mb} MB`);
          }
        },
        () => {
          // Fallback to uncompressed GLB if needed
          loader.load(
            '/elyssa_3d/elyssa.glb',
            (gltf) => {
              const model = gltf.scene;
              modelRootRef.current = model;
              const bbox = new THREE.Box3().setFromObject(model);
              const center = bbox.getCenter(new THREE.Vector3());
              const size = bbox.getSize(new THREE.Vector3());
              model.position.sub(center);
              orientGroup.add(model);

              const maxDim = Math.max(size.x, size.y, size.z);
              const zoomOut = 1.35;
              const half = (maxDim / 2) * zoomOut;
              camera.left = -half * aspect;
              camera.right = half * aspect;
              camera.top = half;
              camera.bottom = -half;
              camera.updateProjectionMatrix();

              setModelLoaded(true);
              setLoadProgress(100);
              setStatusMessage('3D Board Interactive');
            },
            undefined,
            () => {
              setStatusMessage('3D viewer preview');
            }
          );
        }
      );
    };

    // Lazy load observer: start downloading when approaching section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            loadModel();
          } else {
            isVisible = false;
          }
        });
      },
      { rootMargin: '400px 0px 400px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Touch and Drag to orbit
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseXRef.current;
      prevMouseXRef.current = e.clientX;
      userRotationYRef.current += dx * 0.01;
    };
    const onMouseUp = () => {
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
      prevMouseXRef.current = e.touches[0].clientX;
      userRotationYRef.current += dx * 0.012;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    domEl.addEventListener('touchmove', onTouchMove, { passive: true });
    domEl.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Pause renders when off-screen

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (flipGroupRef.current) {
        const currentRot = flipGroupRef.current.rotation.y;
        const targetRot = targetFlipRef.current + userRotationYRef.current;
        flipGroupRef.current.rotation.y += (targetRot - currentRot) * Math.min(dt * 5, 1);
      }

      if (floatGroupRef.current) {
        floatGroupRef.current.position.y = Math.sin(t * 1.4) * 0.035;
        floatGroupRef.current.rotation.y = Math.sin(t * 0.7) * 0.02;
        floatGroupRef.current.rotation.x = Math.sin(t * 0.5) * 0.015;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const asp = w / h;
      camera.left = -1.2 * asp;
      camera.right = 1.2 * asp;
      camera.top = 1.2;
      camera.bottom = -1.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onTouchStart);
      domEl.removeEventListener('touchmove', onTouchMove);
      domEl.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <section className="anatomy-section" id="anatomy" ref={sectionRef}>
      <div className="section-wrap">
        <div className="section-label light">
          <span>01 / 02</span>
          <span>Board Anatomy & Architecture</span>
        </div>

        <div className="anatomy-header">
          <h2>
            Meet the parts<br />
            that make <em>Elyssa.</em>
          </h2>
          <p>
            Rotate the board and inspect the core architecture that drives your builds.
            Select any component to see its function and observe the board position in real time.
          </p>
        </div>

        <div className="anatomy-grid">
          <div className="anatomy-viewer-box">
            <div className="viewer-top-bar">
              <span className={`viewer-status-dot ${modelLoaded ? '' : 'is-loading'}`}></span>
              <span>{statusMessage}</span>
            </div>

            {/* Loading progress bar overlay */}
            {!modelLoaded && (
              <div className="viewer-progress-overlay">
                <div className="viewer-progress-track">
                  <div className="viewer-progress-fill" style={{ width: `${Math.max(loadProgress, 8)}%` }}></div>
                </div>
                <span className="viewer-progress-text">{statusMessage}</span>
              </div>
            )}

            <div id="canvas-container" ref={containerRef}></div>

            <div className="viewer-bottom-bar">
              <div className="viewer-hint">
                Drag to rotate · Click any component to highlight
              </div>
              <div className="viewer-axes">
                <span className="axis-badge" style={{ borderColor: 'var(--acid)', color: 'var(--acid)' }}>
                  X
                </span>
                <span className="axis-badge">Y</span>
                <span className="axis-badge">Z</span>
              </div>
            </div>
          </div>

          <div className="story-step-list">
            {COMPONENTS.map((item) => (
              <article
                key={item.id}
                className={`story-step-item ${activeComponent === item.id ? 'is-active' : ''}`}
                onClick={() => selectComponent(item.id)}
              >
                <span className="story-step-num">{item.num}</span>
                <div className="story-step-content">
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
