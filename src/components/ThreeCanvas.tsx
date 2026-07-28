import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SculpturalShape, MaterialParams, EnvironmentType, LightParams } from '../types';
import { ENVIRONMENTS } from '../data';

interface ThreeCanvasProps {
  shape: SculpturalShape;
  currentParams: MaterialParams;
  originalParams: MaterialParams;
  environment: EnvironmentType;
  lightParams: LightParams;
  compareMode: boolean;
  splitRatio: number;
}

// Procedural Canvas Texture Cache to prevent memory leaks
const textureCache = new Map<string, THREE.CanvasTexture>();

function createProceduralTexture(type: 'none' | 'weave' | 'dots' | 'noise', frequency: number): THREE.CanvasTexture | null {
  if (type === 'none') return null;

  const cacheKey = `${type}_${frequency}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base grey (neutral bump height)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  if (type === 'weave') {
    const step = size / frequency;
    ctx.lineWidth = step * 0.35;
    for (let i = 0; i <= size; i += step) {
      // Horizontal threads (white/highlight)
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();

      // Vertical threads (black/shadow)
      ctx.strokeStyle = '#202020';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }
  } else if (type === 'dots') {
    const step = size / frequency;
    const radius = step * 0.25;
    ctx.fillStyle = '#ffffff';
    for (let x = step / 2; x < size; x += step) {
      for (let y = step / 2; y < size; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'noise') {
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      imgData.data[i] = val;
      imgData.data[i + 1] = val;
      imgData.data[i + 2] = val;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  textureCache.set(cacheKey, texture);
  return texture;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  shape,
  currentParams,
  originalParams,
  environment,
  lightParams,
  compareMode,
  splitRatio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // References to meshes and lights for quick property updates
  const meshRef = useRef<THREE.Mesh | null>(null);
  const activeMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const originalMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Reflector panels representing softboxes for reflections
  const leftSoftboxRef = useRef<THREE.Mesh | null>(null);
  const rightSoftboxRef = useRef<THREE.Mesh | null>(null);
  const topSoftboxRef = useRef<THREE.Mesh | null>(null);

  // Re-create geometry whenever shape changes
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return;

    let geometry: THREE.BufferGeometry;

    switch (shape) {
      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(0.5, 0.18, 180, 24);
        break;
      case 'gem':
        geometry = new THREE.IcosahedronGeometry(0.72, 1); // 1 subdivision for gorgeous facets
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.65, 64, 64);
        break;
      case 'roundedCube':
      default:
        // Create an organic torus/donut shape which shows off gloss/shading beautifully
        geometry = new THREE.TorusGeometry(0.48, 0.22, 32, 64);
        break;
    }

    const oldGeo = meshRef.current.geometry;
    meshRef.current.geometry = geometry;
    oldGeo.dispose();

    // If faceted gem, compute flat vertex normals for rich gemstone reflections
    if (shape === 'gem') {
      meshRef.current.geometry.computeVertexNormals();
      meshRef.current.material = activeMaterialRef.current!; // ensure flat shading or standard material respects it
    }
  }, [shape]);

  // Update material params dynamically (without re-initializing the WebGL canvas)
  useEffect(() => {
    const updateMaterial = (material: THREE.MeshPhysicalMaterial | null, params: MaterialParams) => {
      if (!material) return;

      material.color.set(params.color);
      material.roughness = params.roughness;
      material.metalness = params.metalness;
      material.transmission = params.transmission;
      material.ior = params.ior;
      material.thickness = params.thickness;
      material.clearcoat = params.clearcoat;
      material.clearcoatRoughness = params.clearcoatRoughness;
      material.sheen = params.sheen;
      material.sheenColor.set(params.sheenColor || '#ffffff');

      // Setup procedural textures
      const bumpTexture = createProceduralTexture(params.bumpType, params.bumpFrequency);
      if (bumpTexture) {
        material.bumpMap = bumpTexture;
        material.bumpScale = params.bumpScale;
      } else {
        material.bumpMap = null;
      }

      material.needsUpdate = true;
    };

    updateMaterial(activeMaterialRef.current, currentParams);
    updateMaterial(originalMaterialRef.current, originalParams);
  }, [currentParams, originalParams]);

  // Update lighting position & properties
  useEffect(() => {
    if (!keyLightRef.current || !fillLightRef.current) return;

    // Convert spherical coordinates (yaw, pitch) into Cartesian (X,Y,Z)
    const radYaw = THREE.MathUtils.degToRad(lightParams.yaw);
    const radPitch = THREE.MathUtils.degToRad(lightParams.pitch);
    const d = lightParams.distance;

    const x = d * Math.cos(radPitch) * Math.sin(radYaw);
    const y = d * Math.sin(radPitch);
    const z = d * Math.cos(radPitch) * Math.cos(radYaw);

    keyLightRef.current.position.set(x, y, z);
    keyLightRef.current.intensity = lightParams.intensity;
    keyLightRef.current.color.set(lightParams.color);
    keyLightRef.current.castShadow = lightParams.shadows;

    // Update backlight/fill light position to oppose key light slightly
    fillLightRef.current.position.set(-x * 0.8, y * 0.5, -z * 0.8);
  }, [lightParams]);

  // Update environment theme & colors
  useEffect(() => {
    const env = ENVIRONMENTS.find((e) => e.id === environment);
    if (!env || !sceneRef.current || !ambientLightRef.current || !fillLightRef.current) return;

    // Set scene background
    sceneRef.current.background = new THREE.Color(env.bgColor);

    // Set ambient light
    ambientLightRef.current.color.set(env.ambientColor);
    ambientLightRef.current.intensity = env.ambientIntensity;

    // Set fill light colors
    fillLightRef.current.color.set(env.fillLightColor);

    // Update softbox panel styling for reflective surfaces
    if (leftSoftboxRef.current && rightSoftboxRef.current && topSoftboxRef.current) {
      const leftMat = leftSoftboxRef.current.material as THREE.MeshBasicMaterial;
      const rightMat = rightSoftboxRef.current.material as THREE.MeshBasicMaterial;
      const topMat = topSoftboxRef.current.material as THREE.MeshBasicMaterial;

      if (environment === 'studio') {
        leftMat.color.set('#ffffff');
        leftMat.opacity = 0.6;
        rightMat.color.set('#f1f5f9');
        rightMat.opacity = 0.5;
        topMat.color.set('#ffffff');
        topMat.opacity = 0.4;
      } else if (environment === 'sunset') {
        leftMat.color.set('#f59e0b'); // Golden
        leftMat.opacity = 0.8;
        rightMat.color.set('#6366f1'); // Indigo/purple
        rightMat.opacity = 0.7;
        topMat.color.set('#ef4444'); // warm orange-red
        topMat.opacity = 0.5;
      } else if (environment === 'neon') {
        leftMat.color.set('#ec4899'); // Neon Pink
        leftMat.opacity = 0.9;
        rightMat.color.set('#06b6d4'); // Electric Cyan
        rightMat.opacity = 0.9;
        topMat.color.set('#8b5cf6'); // Violet
        topMat.opacity = 0.6;
      }
    }
  }, [environment]);

  // Complete Three.js Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Interactive Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 6.0;
    controlsRef.current = controls;

    // 5. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.0);
    keyLight.position.set(2, 2, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight('#e2e8f0', 0.8);
    fillLight.position.set(-2, 1, -2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 6. Reflective Studio Softbox Panels
    const createSoftboxPanel = (w: number, h: number, pos: THREE.Vector3, rotY: number) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const panel = new THREE.Mesh(geo, mat);
      panel.position.copy(pos);
      panel.rotation.y = rotY;
      scene.add(panel);
      return panel;
    };

    leftSoftboxRef.current = createSoftboxPanel(1.8, 3.5, new THREE.Vector3(-3.5, 1.5, 2.0), Math.PI / 4);
    rightSoftboxRef.current = createSoftboxPanel(1.8, 3.5, new THREE.Vector3(3.5, 1.5, -2.0), -Math.PI / 4);
    topSoftboxRef.current = createSoftboxPanel(3.0, 1.5, new THREE.Vector3(0, 3.8, 0), 0);
    topSoftboxRef.current.rotation.x = Math.PI / 2;

    // 7. Base Sculptural Mesh setup
    const defaultGeo = new THREE.TorusGeometry(0.48, 0.22, 32, 64);
    const activeMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.1,
      metalness: 0.0,
    });
    const originalMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.1,
      metalness: 0.0,
    });

    activeMaterialRef.current = activeMaterial;
    originalMaterialRef.current = originalMaterial;

    const mesh = new THREE.Mesh(defaultGeo, activeMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // 8. Studio Floor to receive soft shadows
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.92;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle dark circular platform
    const ringGeo = new THREE.RingGeometry(0.95, 1.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#334155', side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.91;
    scene.add(ringMesh);

    // 9. Resize Handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;

      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(containerRef.current);

    // 10. Frame Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation subtle drift
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.003;
        meshRef.current.rotation.x += 0.001;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current && meshRef.current) {
        const r = rendererRef.current;
        const s = sceneRef.current;
        const c = cameraRef.current;

        const w = containerRef.current?.clientWidth || width;
        const h = containerRef.current?.clientHeight || height;

        if (compareMode) {
          // Enable scissors rendering
          r.setScissorTest(true);

          // Left side: Original material
          r.setViewport(0, 0, w * splitRatio, h);
          r.setScissor(0, 0, w * splitRatio, h);
          meshRef.current.material = originalMaterialRef.current!;
          r.render(s, c);

          // Right side: Active material
          r.setViewport(w * splitRatio, 0, w * (1 - splitRatio), h);
          r.setScissor(w * splitRatio, 0, w * (1 - splitRatio), h);
          meshRef.current.material = activeMaterialRef.current!;
          r.render(s, c);

          r.setScissorTest(false);
        } else {
          // Render full screen
          r.setViewport(0, 0, w, h);
          meshRef.current.material = activeMaterialRef.current!;
          r.render(s, c);
        }
      }
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      defaultGeo.dispose();
      activeMaterial.dispose();
      originalMaterial.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [compareMode, splitRatio]);

  return (
    <div
      id="three-canvas-container"
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-slate-950 select-none cursor-grab active:cursor-grabbing"
    />
  );
};
