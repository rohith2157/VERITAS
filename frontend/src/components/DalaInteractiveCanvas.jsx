import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Exact Dala 3D Particle Morphing Canvas
 * Recreates the exact multi-shape scroll-driven 3D particle constellation:
 * 1. Brain (Right) -> 2. Brain (Left) -> 3. Dispersed Chaos ->
 * 4. Lightbulb (Left) -> 5. Sphere / Globe (Right) ->
 * 6. Wireframe Prisms (Investors) -> 7. Dala Logo (Center)
 */
export default function DalaInteractiveCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Generate Sharp Outlined Triangle Sprite Texture
    const createTriangleTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 64, 64);

      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(54, 52);
      ctx.lineTo(10, 52);
      ctx.closePath();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      const texture = new THREE.CanvasTexture(c);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };

    const triangleTexture = createTriangleTexture();

    // 3. Mathematical Shape Coordinate Generators (N = 2200 particles)
    const COUNT = 2200;

    // Palette Colors
    const palette = [
      new THREE.Color('#8052ff'), // Electric Iris
      new THREE.Color('#ffb829'), // Saffron Spark
      new THREE.Color('#15846e'), // Deep Verdant
      new THREE.Color('#38bdf8'), // Cyan Blue
      new THREE.Color('#ec4899'), // Magenta
      new THREE.Color('#ffffff')  // Bone White
    ];

    const amberColor = new THREE.Color('#ffb829');
    const goldColor = new THREE.Color('#fcd34d');
    const violetColor = new THREE.Color('#8052ff');
    const tealColor = new THREE.Color('#15846e');

    const shapes = [];
    const shapeColors = [];

    const createBuffer = () => new Float32Array(COUNT * 3);

    // --- SHAPE 0: BRAIN (Right-Aligned) ---
    const sBrainRight = createBuffer();
    const cBrainRight = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const lobe = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = (v - 0.5) * Math.PI;

      const rx = 1.9 + Math.random() * 0.5;
      const ry = 1.5 + Math.random() * 0.4;
      const rz = 1.5 + Math.random() * 0.4;

      const bx = 2.4 + lobe * 0.55 + Math.cos(theta) * Math.cos(phi) * rx;
      const by = -0.1 + Math.sin(theta) * ry * 0.9;
      const bz = Math.sin(phi) * rz;

      sBrainRight[i * 3] = bx;
      sBrainRight[i * 3 + 1] = by;
      sBrainRight[i * 3 + 2] = bz;

      const col = palette[Math.floor(Math.random() * palette.length)];
      cBrainRight[i * 3] = col.r;
      cBrainRight[i * 3 + 1] = col.g;
      cBrainRight[i * 3 + 2] = col.b;
    }
    shapes.push(sBrainRight);
    shapeColors.push(cBrainRight);

    // --- SHAPE 1: BRAIN (Left-Aligned, Tilted) ---
    const sBrainLeft = createBuffer();
    const cBrainLeft = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const bx = (sBrainRight[i * 3] - 2.4) * 1.1 - 2.6;
      const by = sBrainRight[i * 3 + 1] * 1.1 + 0.1;
      const bz = sBrainRight[i * 3 + 2] * 1.1;

      const rotAngle = -0.35;
      const rx = bx * Math.cos(rotAngle) - bz * Math.sin(rotAngle);
      const rz = bx * Math.sin(rotAngle) + bz * Math.cos(rotAngle);

      sBrainLeft[i * 3] = rx;
      sBrainLeft[i * 3 + 1] = by;
      sBrainLeft[i * 3 + 2] = rz;

      cBrainLeft[i * 3] = cBrainRight[i * 3];
      cBrainLeft[i * 3 + 1] = cBrainRight[i * 3 + 1];
      cBrainLeft[i * 3 + 2] = cBrainRight[i * 3 + 2];
    }
    shapes.push(sBrainLeft);
    shapeColors.push(cBrainLeft);

    // --- SHAPE 2: DISPERSED CHAOS ---
    const sChaos = createBuffer();
    const cChaos = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      sChaos[i * 3] = (Math.random() - 0.5) * 16.0;
      sChaos[i * 3 + 1] = (Math.random() - 0.5) * 12.0;
      sChaos[i * 3 + 2] = (Math.random() - 0.5) * 10.0;

      const col = palette[Math.floor(Math.random() * palette.length)];
      cChaos[i * 3] = col.r;
      cChaos[i * 3 + 1] = col.g;
      cChaos[i * 3 + 2] = col.b;
    }
    shapes.push(sChaos);
    shapeColors.push(cChaos);

    // --- SHAPE 3: LIGHTBULB (Left-Aligned, Yellow Dome & Purple Base) ---
    const sLightbulb = createBuffer();
    const cLightbulb = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const part = Math.random();
      let lx = 0, ly = 0, lz = 0;
      let col = amberColor;

      if (part < 0.65) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const phi = (v * 0.65 - 0.15) * Math.PI;

        const r = 2.1 + Math.random() * 0.35;
        lx = Math.cos(theta) * Math.cos(phi) * r;
        ly = 1.1 + Math.sin(phi) * r;
        lz = Math.sin(theta) * Math.cos(phi) * r;

        col = Math.random() > 0.4 ? amberColor : goldColor;
      } else if (part < 0.85) {
        const t = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const r = (1.5 - t * 0.65) + (Math.random() - 0.5) * 0.2;
        lx = Math.cos(theta) * r;
        ly = 0.3 - t * 1.5;
        lz = Math.sin(theta) * r;

        col = Math.random() > 0.5 ? goldColor : violetColor;
      } else {
        const t = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const r = 0.85 + Math.sin(t * 12) * 0.1 + (Math.random() - 0.5) * 0.15;
        lx = Math.cos(theta) * r;
        ly = -1.2 - t * 1.2;
        lz = Math.sin(theta) * r;

        col = Math.random() > 0.5 ? violetColor : tealColor;
      }

      const angleTilt = 0.2;
      const rx = lx * Math.cos(angleTilt) - ly * Math.sin(angleTilt) - 2.5;
      const ry = lx * Math.sin(angleTilt) + ly * Math.cos(angleTilt) - 0.2;

      sLightbulb[i * 3] = rx;
      sLightbulb[i * 3 + 1] = ry;
      sLightbulb[i * 3 + 2] = lz;

      cLightbulb[i * 3] = col.r;
      cLightbulb[i * 3 + 1] = col.g;
      cLightbulb[i * 3 + 2] = col.b;
    }
    shapes.push(sLightbulb);
    shapeColors.push(cLightbulb);

    // --- SHAPE 4: SPHERE / GLOBE (Right-Aligned) ---
    const sGlobe = createBuffer();
    const cGlobe = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1) - Math.PI / 2;

      const r = 2.4 + (Math.random() - 0.5) * 0.3;
      const gx = 2.7 + Math.cos(theta) * Math.cos(phi) * r;
      const gy = 0.0 + Math.sin(phi) * r;
      const gz = Math.sin(theta) * Math.cos(phi) * r;

      sGlobe[i * 3] = gx;
      sGlobe[i * 3 + 1] = gy;
      sGlobe[i * 3 + 2] = gz;

      const col = palette[Math.floor(Math.random() * palette.length)];
      cGlobe[i * 3] = col.r;
      cGlobe[i * 3 + 1] = col.g;
      cGlobe[i * 3 + 2] = col.b;
    }
    shapes.push(sGlobe);
    shapeColors.push(cGlobe);

    // --- SHAPE 5: INVESTORS PRISMS / CLUSTER (Left-Aligned) ---
    const sPrisms = createBuffer();
    const cPrisms = createBuffer();
    const prismCenters = [
      { x: -3.4, y: 1.2, z: 0 },
      { x: -2.0, y: 2.2, z: -1 },
      { x: -3.8, y: -1.0, z: 1 },
      { x: -2.2, y: -1.8, z: 0 },
      { x: -1.5, y: 0.2, z: -1.5 },
      { x: -4.2, y: 0.5, z: -0.5 }
    ];
    for (let i = 0; i < COUNT; i++) {
      const c = prismCenters[i % prismCenters.length];
      const r = 0.8 * Math.pow(Math.random(), 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      sPrisms[i * 3] = c.x + Math.cos(theta) * Math.cos(phi) * r;
      sPrisms[i * 3 + 1] = c.y + Math.sin(phi) * r;
      sPrisms[i * 3 + 2] = c.z + Math.sin(theta) * Math.cos(phi) * r;

      const col = palette[(i % prismCenters.length) % palette.length];
      cPrisms[i * 3] = col.r;
      cPrisms[i * 3 + 1] = col.g;
      cPrisms[i * 3 + 2] = col.b;
    }
    shapes.push(sPrisms);
    shapeColors.push(cPrisms);

    // --- SHAPE 6: DALA LOGO (Center) ---
    const sLogo = createBuffer();
    const cLogo = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const quad = i % 4;
      const u = Math.random();
      const v = Math.random();
      let lx = 0, ly = 0;

      if (quad === 0) {
        lx = -1.6 + u * 1.5;
        ly = 0.1 + v * 2.2 * (1 - u * 0.4);
      } else if (quad === 1) {
        lx = 0.1 + u * 1.8;
        ly = 0.1 + v * 2.0 * (1 - u);
      } else if (quad === 2) {
        lx = -1.8 + u * 1.7;
        ly = -0.1 - v * 2.2 * (1 - u * 0.3);
      } else {
        lx = 0.1 + u * 1.8;
        ly = -0.1 - v * 1.8 * (1 - u * 0.4);
      }

      sLogo[i * 3] = lx;
      sLogo[i * 3 + 1] = ly;
      sLogo[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      let col = violetColor;
      if (quad === 0) col = tealColor;
      else if (quad === 1) col = violetColor;
      else if (quad === 2) col = new THREE.Color('#38bdf8');
      else col = amberColor;

      cLogo[i * 3] = col.r;
      cLogo[i * 3 + 1] = col.g;
      cLogo[i * 3 + 2] = col.b;
    }
    shapes.push(sLogo);
    shapeColors.push(cLogo);

    // 4. Create Active Particle Mesh with Instanced / Buffer Geometry
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(shapes[0]);
    const currentColors = new Float32Array(shapeColors[0]);

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.20,
      map: triangleTexture,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // 5. Large 3D Wireframe Prisms (Visible in Investor Section 5)
    const prismGroup = new THREE.Group();
    const prismMeshes = [];
    const prismColors = ['#8052ff', '#ffb829', '#15846e', '#38bdf8', '#ec4899', '#ffffff'];

    prismCenters.forEach((c, idx) => {
      const tetGeom = new THREE.TetrahedronGeometry(0.75 + Math.random() * 0.35, 0);
      const edges = new THREE.EdgesGeometry(tetGeom);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(prismColors[idx % prismColors.length]),
        transparent: true,
        opacity: 0.0,
        linewidth: 1.5
      });
      const lineMesh = new THREE.LineSegments(edges, lineMat);
      lineMesh.position.set(c.x, c.y, c.z);
      prismGroup.add(lineMesh);
      prismMeshes.push({
        mesh: lineMesh,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        mat: lineMat
      });
    });
    scene.add(prismGroup);

    // 6. Smooth Mouse & Animation Variables
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic Scroll Tracking
    let targetScrollNorm = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollNorm = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    let clock = new THREE.Clock();
    let smoothScroll = 0;

    // 7. Render Loop with Smooth Scroll-Driven Morphing
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Lerp scroll
      smoothScroll += (targetScrollNorm - smoothScroll) * 0.08;

      // Map smoothScroll (0 to 1) into index in [0, 6]
      const totalStages = 6;
      const stageFloat = Math.min(Math.max(smoothScroll * totalStages, 0), totalStages);
      const stageIndex = Math.min(Math.floor(stageFloat), totalStages - 1);
      const alpha = stageFloat - stageIndex;

      // Current shape & next shape
      const fromShape = shapes[stageIndex];
      const toShape = shapes[stageIndex + 1];
      const fromColor = shapeColors[stageIndex];
      const toColor = shapeColors[stageIndex + 1];

      // Update particle positions and colors
      const posAttr = geometry.attributes.position.array;
      const colAttr = geometry.attributes.color.array;

      for (let i = 0; i < COUNT; i++) {
        const idx = i * 3;

        // Subtle organic breathing noise
        const breath = Math.sin(elapsed * 1.5 + i) * 0.035;

        const x1 = fromShape[idx];
        const y1 = fromShape[idx + 1];
        const z1 = fromShape[idx + 2];

        const x2 = toShape[idx];
        const y2 = toShape[idx + 1];
        const z2 = toShape[idx + 2];

        posAttr[idx] = x1 + (x2 - x1) * alpha + breath;
        posAttr[idx + 1] = y1 + (y2 - y1) * alpha + breath;
        posAttr[idx + 2] = z1 + (z2 - z1) * alpha;

        // Color lerp
        colAttr[idx] = fromColor[idx] + (toColor[idx] - fromColor[idx]) * alpha;
        colAttr[idx + 1] = fromColor[idx + 1] + (toColor[idx + 1] - fromColor[idx + 1]) * alpha;
        colAttr[idx + 2] = fromColor[idx + 2] + (toColor[idx + 2] - fromColor[idx + 2]) * alpha;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // Handle Wireframe Prisms visibility (active near stage 5 = investors)
      const investorProximity = Math.max(0, 1 - Math.abs(stageFloat - 5.0) * 1.6);
      prismMeshes.forEach(p => {
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mat.opacity = investorProximity * 0.85;
      });

      // Camera gentle float and mouse parallax
      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.35;
      camera.lookAt(0, 0, 0);

      // Point cloud gentle global rotation
      pointCloud.rotation.y = elapsed * 0.06 + mouse.x * 0.12;
      pointCloud.rotation.x = Math.sin(elapsed * 0.05) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      triangleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}

