import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Authentic Dala 3D Particle Morphing Canvas
 * High-density WebGL particle constellation matching dala.craftedbygc.com:
 * 
 * 1. Brain (Hero / Stage 0):
 *    - Right-aligned (x ≈ 2.70, left boundary > 0.4, zero overlap with left 40% text)
 *    - Dual anatomical cerebral hemispheres (left at x ≈ 1.62, right at x ≈ 3.78)
 *    - Clear longitudinal cerebral fissure (deep sagittal midline indentation)
 *    - Organic gyri and sulci trigonometric folding
 *    - 4,500 tiny triangular crystal particles
 *    - Authentic color zoning:
 *      * Top/Anterior (y > 1.15): Emerald Green (#15846e) & Cyan (#38bdf8)
 *      * Middle/Lateral (-0.75 <= y <= 1.15): Saffron (#ffb829) & Gold (#fcd34d)
 *      * Base/Posterior (y < -0.75): Electric Iris Violet (#8052ff) & Magenta (#ec4899)
 *      * Fissure / Core: Radiant White (#ffffff)
 * 2. Removed distracting wireframe line cages; replaced by subtle stardust & 5 floating prism textures (1.png - 5.png)
 * 3. Smooth scroll morphing across 6 stages:
 *    Stage 0: Brain -> Stage 1: Document Ring -> Stage 2: Global Sphere ->
 *    Stage 3: Verification Core -> Stage 4: Nebula -> Stage 5: Sculpture
 * 4. Dual theme: void black #000000 (AdditiveBlending) vs light #f8f9fc (NormalBlending)
 */
export default function DalaInteractiveCanvas({ theme = 'dark', scrollProgress }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const materialRef = useRef(null);
  const spriteMaterialsRef = useRef([]);
  const ambientMaterialRef = useRef(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    if (typeof scrollProgress === 'number') {
      progressRef.current = scrollProgress;
    }
  }, [scrollProgress]);

  // Dynamically update canvas background and materials when theme changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(theme === 'light' ? 0xf8f9fc : 0x000000);
    }
    if (materialRef.current) {
      materialRef.current.blending = theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending;
      materialRef.current.opacity = theme === 'light' ? 0.88 : 0.96;
      materialRef.current.needsUpdate = true;
    }
    if (spriteMaterialsRef.current) {
      spriteMaterialsRef.current.forEach((mat) => {
        mat.blending = theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending;
        mat.opacity = theme === 'light' ? 0.65 : 0.85;
        mat.needsUpdate = true;
      });
    }
    if (ambientMaterialRef.current) {
      ambientMaterialRef.current.blending = theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending;
      ambientMaterialRef.current.color = new THREE.Color(theme === 'light' ? 0x8892b0 : 0xffffff);
      ambientMaterialRef.current.opacity = theme === 'light' ? 0.30 : 0.42;
      ambientMaterialRef.current.needsUpdate = true;
    }
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    let aspect = width / height;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'light' ? 0xf8f9fc : 0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    if (aspect < 1.2) {
      camera.position.set(0, 0, 12 * (1.2 / Math.max(aspect, 0.7)));
    } else {
      camera.position.set(0, 0, 12);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Generate Sharp Outlined Triangle Sprite Texture with Soft Glow Core
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

      // Sharp stroke
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Subtle luminous facet fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fill();

      const texture = new THREE.CanvasTexture(c);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };

    const triangleTexture = createTriangleTexture();

    // 3. Mathematical Shape Coordinate Generators (N = 4,500 particles for dense high-res anatomy)
    const COUNT = 4500;

    // Authentic Color Palette matching Image 2
    const emeraldColor = new THREE.Color('#15846e');
    const cyanColor = new THREE.Color('#38bdf8');
    const saffronColor = new THREE.Color('#ffb829');
    const goldColor = new THREE.Color('#fcd34d');
    const violetColor = new THREE.Color('#8052ff');
    const magentaColor = new THREE.Color('#ec4899');
    const radiantWhite = new THREE.Color('#ffffff');

    const shapes = [];
    const shapeColors = [];

    const createBuffer = () => new Float32Array(COUNT * 3);

    // =========================================================================
    // --- STAGE 0: DUAL-HEMISPHERE ORGANIC BRAIN (HERO / RIGHT-ALIGNED) ---
    // =========================================================================
    const sBrain = createBuffer();
    const cBrain = createBuffer();

    const fissureCount = 540;
    const hemiCount = Math.floor((COUNT - fissureCount) / 2); // 1980 per hemisphere
    let bIdx = 0;

    // Left hemisphere (h = -1, centered at x ≈ 1.62) & Right hemisphere (h = +1, centered at x ≈ 3.78)
    for (let h = -1; h <= 1; h += 2) {
      const centerX = h === -1 ? 1.62 : 3.78;
      for (let k = 0; k < hemiCount; k++) {
        // Fibonacci spherical distribution for uniform surface coverage
        const phi = Math.acos(1 - 2 * ((k + 0.5) / hemiCount));
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;

        const ux = Math.sin(phi) * Math.cos(theta);
        const uy = Math.cos(phi);
        const uz = Math.sin(phi) * Math.sin(theta);

        // Medial wall flattening: particles pointing towards midline (ux < 0) are compressed
        // to form the deep longitudinal cerebral fissure at x ≈ 2.70
        let lateralComp = ux;
        if (lateralComp < 0) {
          lateralComp *= 0.35;
        }

        // Base anatomical ellipsoid semi-axes
        let rx = 1.05;
        let ry = 1.80;
        let rz = 2.05;

        // Anatomical tapering: frontal lobe arch vs occipital lobe downward curve
        if (uz < 0) {
          ry *= (1.0 - 0.14 * Math.abs(uz));
        } else {
          ry *= (1.0 + 0.08 * uz);
        }

        // Temporal lobe lateral-inferior expansion
        const temporalMask = Math.max(0, lateralComp) * Math.max(0, -uy) * Math.max(0, uz + 0.3);
        rx += 0.30 * temporalMask;

        // Ventral tuck (underneath the cerebrum)
        if (uy < -0.35) {
          ry *= (0.88 + 0.12 * (uy + 1.0));
        }

        // Organic Gyri and Sulci folds: multi-harmonic trigonometric displacement field
        const angle = Math.atan2(uz, lateralComp);
        const f1 = Math.sin(7.0 * angle + Math.cos(5.0 * uy) * 2.2);
        const f2 = Math.cos(8.5 * uy + Math.sin(6.0 * uz) * 1.8);
        const f3 = Math.sin(13.0 * angle + 10.0 * uy);
        const f4 = Math.cos(16.0 * (lateralComp * 1.4 + uz * 1.2));

        const gyrusNoise = f1 * 0.46 + f2 * 0.36 + f3 * 0.12 + f4 * 0.06;
        const foldDisplacement = gyrusNoise > 0
          ? Math.pow(gyrusNoise, 0.85) * 0.22
          : -Math.pow(Math.abs(gyrusNoise), 0.65) * 0.26;

        // Volumetric depth: cortical mantle (85%) vs subcortical core (15%)
        const isCore = Math.random() < 0.15;
        const rLayer = isCore
          ? (0.42 + Math.random() * 0.45) * (1.0 + foldDisplacement * 0.35)
          : 1.0 + foldDisplacement + (Math.random() - 0.5) * 0.07;

        // Final coordinates:
        // Left hemisphere expands towards left (-lateralComp), Right expands towards right (+lateralComp)
        const px = centerX + (h === -1 ? -lateralComp : lateralComp) * rx * rLayer;
        const py = 0.05 + uy * ry * rLayer;
        const pz = uz * rz * rLayer;

        sBrain[bIdx * 3] = px;
        sBrain[bIdx * 3 + 1] = py;
        sBrain[bIdx * 3 + 2] = pz;

        // Authentic Color Zoning matching Image 2:
        let col;
        if (isCore && Math.abs(px - 2.70) < 0.6) {
          col = Math.random() > 0.2 ? radiantWhite : goldColor;
        } else if (py > 1.15) {
          // Top / Anterior: Emerald green and Turquoise/Cyan
          col = (py > 1.45 || (uz > 0.2 && Math.random() > 0.45)) ? cyanColor : emeraldColor;
        } else if (py >= -0.75) {
          // Middle / Lateral: Saffron yellow and Gold
          col = Math.random() > 0.45 ? saffronColor : goldColor;
        } else {
          // Base / Posterior / Bottom Right: Electric iris violet and Magenta
          col = Math.random() > 0.4 ? violetColor : magentaColor;
        }

        cBrain[bIdx * 3] = col.r;
        cBrain[bIdx * 3 + 1] = col.g;
        cBrain[bIdx * 3 + 2] = col.b;
        bIdx++;
      }
    }

    // Longitudinal Cerebral Fissure & Corpus Callosum core particles (sagittal midline x ≈ 2.70)
    while (bIdx < COUNT) {
      const t = (bIdx - (COUNT - fissureCount)) / fissureCount;
      const z = -1.6 + t * 3.2 + (Math.random() - 0.5) * 0.2;
      const archY = Math.sin(t * Math.PI) * 0.9 - 0.2;
      const py = archY + (Math.random() - 0.5) * 0.5;
      const px = 2.70 + (Math.random() - 0.5) * 0.36;
      const pz = z;

      sBrain[bIdx * 3] = px;
      sBrain[bIdx * 3 + 1] = py;
      sBrain[bIdx * 3 + 2] = pz;

      // Deep Fissure / Core is radiant white!
      const col = Math.random() > 0.12 ? radiantWhite : goldColor;
      cBrain[bIdx * 3] = col.r;
      cBrain[bIdx * 3 + 1] = col.g;
      cBrain[bIdx * 3 + 2] = col.b;
      bIdx++;
    }

    shapes.push(sBrain);
    shapeColors.push(cBrain);

    // =========================================================================
    // --- STAGE 1: DOCUMENT RING (CYLINDRICAL CITATION & PAPER CARDS RING) ---
    // =========================================================================
    const sDocRing = createBuffer();
    const cDocRing = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const isTile = i < COUNT * 0.65;
      let rx, ry, rz;
      let col;

      if (isTile) {
        // Floating document / paper card rectangles orbiting in a ring
        const numTiles = 12;
        const tileIdx = i % numTiles;
        const tileAngle = (tileIdx / numTiles) * Math.PI * 2;
        const u = Math.random() - 0.5;
        const v = Math.random() - 0.5;

        const R = 3.3;
        const cx = Math.cos(tileAngle) * R;
        const cz = Math.sin(tileAngle) * R;
        const cy = ((tileIdx % 3) - 1) * 0.6 + v * 1.8;

        const tx = -Math.sin(tileAngle) * u * 0.85;
        const tz = Math.cos(tileAngle) * u * 0.85;

        rx = cx + tx + 0.5;
        ry = cy;
        rz = cz + tz;

        col = Math.random() > 0.35 ? radiantWhite : (Math.random() > 0.5 ? saffronColor : cyanColor);
      } else {
        // Tilted orbital streams
        const angle = Math.random() * Math.PI * 2;
        const rad = 2.8 + Math.random() * 1.2;
        const ringY = (Math.random() - 0.5) * 2.4;
        const tilt = 0.35;
        const rawX = Math.cos(angle) * rad + 0.5;
        const rawZ = Math.sin(angle) * rad;

        rx = rawX;
        ry = ringY * Math.cos(tilt) - rawZ * Math.sin(tilt);
        rz = ringY * Math.sin(tilt) + rawZ * Math.cos(tilt);

        const pick = Math.random();
        if (pick < 0.35) col = emeraldColor;
        else if (pick < 0.65) col = cyanColor;
        else col = violetColor;
      }

      sDocRing[i * 3] = rx;
      sDocRing[i * 3 + 1] = ry;
      sDocRing[i * 3 + 2] = rz;

      cDocRing[i * 3] = col.r;
      cDocRing[i * 3 + 1] = col.g;
      cDocRing[i * 3 + 2] = col.b;
    }
    shapes.push(sDocRing);
    shapeColors.push(cDocRing);

    // =========================================================================
    // --- STAGE 2: GLOBAL SPHERE (INSTITUTIONAL ECOSYSTEM GLOBE / RIGHT-ALIGNED) ---
    // =========================================================================
    const sGlobe = createBuffer();
    const cGlobe = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      let gx, gy, gz;
      let col;

      if (i < COUNT * 0.74) {
        // Outer spherical crust (R = 3.3, centered at x = 2.4)
        const phi = Math.acos(1 - 2 * (i / (COUNT * 0.74)));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 3.3 + (Math.random() - 0.5) * 0.25;

        gx = 2.4 + Math.sin(phi) * Math.cos(theta) * r;
        gy = Math.cos(phi) * r;
        gz = Math.sin(phi) * Math.sin(theta) * r;

        // Latitude color zoning
        const lat = Math.cos(phi);
        if (lat > 0.32) {
          col = Math.random() > 0.4 ? emeraldColor : cyanColor;
        } else if (lat >= -0.30) {
          col = Math.random() > 0.5 ? saffronColor : goldColor;
        } else {
          col = Math.random() > 0.5 ? violetColor : magentaColor;
        }
      } else {
        // Internal glowing core
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const phi = (v - 0.5) * Math.PI;
        const r = 1.0 + Math.random() * 0.8;

        gx = 2.4 + Math.cos(theta) * Math.cos(phi) * r;
        gy = Math.sin(phi) * r;
        gz = Math.sin(theta) * Math.cos(phi) * r;

        col = Math.random() > 0.25 ? radiantWhite : goldColor;
      }

      sGlobe[i * 3] = gx;
      sGlobe[i * 3 + 1] = gy;
      sGlobe[i * 3 + 2] = gz;

      cGlobe[i * 3] = col.r;
      cGlobe[i * 3 + 1] = col.g;
      cGlobe[i * 3 + 2] = col.b;
    }
    shapes.push(sGlobe);
    shapeColors.push(cGlobe);

    // =========================================================================
    // --- STAGE 3: VERIFICATION CORE (CRYSTALLINE BEACON / LEFT-ALIGNED x ≈ -2.5) ---
    // =========================================================================
    const sVerifCore = createBuffer();
    const cVerifCore = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      let vx, vy, vz;
      let col;

      if (i < COUNT * 0.35) {
        // Central Diamond Beacon / Core
        const u = Math.random() * 2 - 1;
        const rad = (1 - Math.abs(u)) * 1.5;
        const theta = Math.random() * Math.PI * 2;

        vx = -2.5 + Math.cos(theta) * rad;
        vy = u * 2.2;
        vz = Math.sin(theta) * rad;

        col = Math.random() > 0.3 ? radiantWhite : saffronColor;
      } else {
        // 3 Concentric Forensic Scanning Rings
        const ringChoice = i % 3;
        const ringRadius = ringChoice === 0 ? 2.2 : (ringChoice === 1 ? 2.8 : 3.4);
        const ringTilt = ringChoice === 0 ? 0.3 : (ringChoice === 1 ? -0.38 : 0.6);
        const theta = Math.random() * Math.PI * 2;
        const ringThick = (Math.random() - 0.5) * 0.2;

        const rx = Math.cos(theta) * (ringRadius + ringThick);
        const rz = Math.sin(theta) * (ringRadius + ringThick);
        const ry = (Math.random() - 0.5) * 0.25;

        vx = -2.5 + rx;
        vy = ry * Math.cos(ringTilt) - rz * Math.sin(ringTilt);
        vz = ry * Math.sin(ringTilt) + rz * Math.cos(ringTilt);

        if (ringChoice === 0) col = saffronColor;
        else if (ringChoice === 1) col = cyanColor;
        else col = violetColor;
      }

      sVerifCore[i * 3] = vx;
      sVerifCore[i * 3 + 1] = vy;
      sVerifCore[i * 3 + 2] = vz;

      cVerifCore[i * 3] = col.r;
      cVerifCore[i * 3 + 1] = col.g;
      cVerifCore[i * 3 + 2] = col.b;
    }
    shapes.push(sVerifCore);
    shapeColors.push(cVerifCore);

    // =========================================================================
    // --- STAGE 4: NEBULA (DISPERSED COSMIC SPIRAL GALAXY) ---
    // =========================================================================
    const sNebula = createBuffer();
    const cNebula = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const arm = i % 3;
      const armAngle = (arm * 2 * Math.PI) / 3;
      const dist = Math.pow(Math.random(), 0.65) * 5.8;
      const theta = armAngle + dist * 1.1 + (Math.random() - 0.5) * 0.5;

      const nx = Math.cos(theta) * dist;
      const ny = (Math.random() - 0.5) * 1.2 * Math.exp(-dist / 3.0);
      const nz = Math.sin(theta) * dist;

      sNebula[i * 3] = nx;
      sNebula[i * 3 + 1] = ny;
      sNebula[i * 3 + 2] = nz;

      let col;
      if (dist < 1.4) {
        col = Math.random() > 0.35 ? radiantWhite : saffronColor;
      } else {
        const pick = Math.random();
        if (pick < 0.35) col = violetColor;
        else if (pick < 0.6) col = magentaColor;
        else if (pick < 0.85) col = cyanColor;
        else col = emeraldColor;
      }

      cNebula[i * 3] = col.r;
      cNebula[i * 3 + 1] = col.g;
      cNebula[i * 3 + 2] = col.b;
    }
    shapes.push(sNebula);
    shapeColors.push(cNebula);

    // =========================================================================
    // --- STAGE 5: SCULPTURE (3D TRIPARTITE LOGO SCULPTURE) ---
    // =========================================================================
    const sSculpture = createBuffer();
    const cSculpture = createBuffer();
    for (let i = 0; i < COUNT; i++) {
      const seg = i % 4;
      const u = Math.random();
      const v = Math.random();
      let sx = 0, sy = 0, sz = 0;
      let col = violetColor;

      if (seg === 0) {
        // Top Petal: Teal / Emerald ribbon rising and curving right
        sx = 0.15 + (u * 1.8) * Math.cos(v * 1.3);
        sy = 0.3 + (0.4 + v * 2.3) * (1 - u * 0.15);
        sz = Math.sin(v * 2.5) * 0.65;
        col = Math.random() > 0.5 ? emeraldColor : cyanColor;
      } else if (seg === 1) {
        // Left Petal: Deep Violet wing swooping left
        sx = -0.25 - (0.4 + u * 2.4) * (1 - v * 0.25);
        sy = (v - 0.5) * 2.6;
        sz = -Math.cos(u * 2.2) * 0.6;
        col = violetColor;
      } else if (seg === 2) {
        // Bottom Petal: Saffron / Amber wave swooping down
        sx = 0.15 + (u * 2.1) * Math.cos(-v * 1.3);
        sy = -0.3 - (0.4 + v * 2.3) * (1 - u * 0.15);
        sz = Math.sin(u * 2.3) * 0.65;
        col = Math.random() > 0.4 ? saffronColor : goldColor;
      } else {
        // Center luminous boundary seam
        sx = (Math.random() - 0.5) * 0.35;
        sy = (Math.random() - 0.5) * 2.4;
        sz = (Math.random() - 0.5) * 0.35;
        col = Math.random() > 0.5 ? radiantWhite : goldColor;
      }

      sSculpture[i * 3] = sx;
      sSculpture[i * 3 + 1] = sy;
      sSculpture[i * 3 + 2] = sz;

      cSculpture[i * 3] = col.r;
      cSculpture[i * 3 + 1] = col.g;
      cSculpture[i * 3 + 2] = col.b;
    }
    shapes.push(sSculpture);
    shapeColors.push(cSculpture);

    // 4. Create Active Particle Cloud Mesh
    const geometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(shapes[0]);
    const currentColors = new Float32Array(shapeColors[0]);

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: triangleTexture,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending,
      opacity: theme === 'light' ? 0.88 : 0.96
    });
    materialRef.current = material;

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // 5. Subtle Ambient Stardust Points in Deep Space Void (No giant wireframes!)
    const AMBIENT_COUNT = 300;
    const ambientGeometry = new THREE.BufferGeometry();
    const ambientPositions = new Float32Array(AMBIENT_COUNT * 3);
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      ambientPositions[i * 3] = (Math.random() - 0.5) * 18;
      ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    const ambientMaterial = new THREE.PointsMaterial({
      size: 0.06,
      color: theme === 'light' ? 0x8892b0 : 0xffffff,
      transparent: true,
      opacity: theme === 'light' ? 0.30 : 0.42,
      blending: theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false
    });
    ambientMaterialRef.current = ambientMaterial;
    const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientPoints);

    // 6. Persistent Glowing Prism Textures (1.png - 5.png) Floating in the Void
    const spriteGroup = new THREE.Group();
    const spriteMeshes = [];
    const spriteMaterials = [];

    const textureLoader = new THREE.TextureLoader();
    const prismTextures = [
      textureLoader.load('/images/1.png'), // Amber
      textureLoader.load('/images/2.png'), // Cyan
      textureLoader.load('/images/3.png'), // Lilac / Violet
      textureLoader.load('/images/4.png'), // Gold / Saffron
      textureLoader.load('/images/5.png')  // Purple / Violet
    ];

    const glowingSpritesData = [
      { textureIdx: 0, x: 5.2, y: 3.4, z: -2.0, scale: 1.4, baseSpeed: 0.7 },   // Amber top-right
      { textureIdx: 1, x: -5.2, y: 3.2, z: -2.2, scale: 1.5, baseSpeed: 0.85 }, // Cyan top-left
      { textureIdx: 2, x: -4.8, y: -2.8, z: -1.2, scale: 1.3, baseSpeed: 0.6 }, // Lilac bottom-left
      { textureIdx: 3, x: 5.6, y: -2.2, z: -1.8, scale: 1.5, baseSpeed: 0.75 }, // Gold mid-right
      { textureIdx: 4, x: -2.2, y: 4.4, z: -2.5, scale: 1.2, baseSpeed: 0.95 }, // Purple top-center
      { textureIdx: 0, x: 3.2, y: -3.8, z: -1.4, scale: 1.3, baseSpeed: 0.7 },  // Amber bottom-right
      { textureIdx: 1, x: -5.8, y: 0.5, z: -2.8, scale: 1.4, baseSpeed: 0.8 },  // Cyan far-left
      { textureIdx: 2, x: 5.8, y: 1.2, z: -2.4, scale: 1.3, baseSpeed: 0.65 }   // Lilac far-right
    ];

    glowingSpritesData.forEach((s, idx) => {
      const spriteMat = new THREE.SpriteMaterial({
        map: prismTextures[s.textureIdx],
        transparent: true,
        blending: theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending,
        opacity: theme === 'light' ? 0.65 : 0.85,
        depthWrite: false
      });
      spriteMaterials.push(spriteMat);

      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(s.x, s.y, s.z);
      sprite.scale.set(s.scale, s.scale, 1);
      spriteGroup.add(sprite);

      spriteMeshes.push({
        sprite,
        mat: spriteMat,
        origX: s.x,
        origY: s.y,
        origZ: s.z,
        scale: s.scale,
        speed: s.baseSpeed,
        seed: idx * 1.37
      });
    });
    spriteMaterialsRef.current = spriteMaterials;
    scene.add(spriteGroup);

    // 7. Interactive Parallax & Smooth Scroll Variables
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

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
      aspect = width / height;
      camera.aspect = aspect;
      if (aspect < 1.2) {
        camera.position.z = 12 * (1.2 / Math.max(aspect, 0.7));
      } else {
        camera.position.z = 12;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const clock = new THREE.Clock();
    let smoothScroll = 0;

    // 8. High-Performance Render Loop with Morphing
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Synchronize smooth scroll (using ASScroll prop if provided, else native)
      if (typeof progressRef.current === 'number') {
        smoothScroll = progressRef.current;
      } else {
        smoothScroll += (targetScrollNorm - smoothScroll) * 0.08;
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 6 Stages: 0 (Brain) -> 1 (Doc Ring) -> 2 (Globe) -> 3 (Core) -> 4 (Nebula) -> 5 (Sculpture)
      const totalTransitions = 5;
      const stageFloat = Math.min(Math.max(smoothScroll * totalTransitions, 0), totalTransitions);
      const stageIndex = Math.min(Math.floor(stageFloat), totalTransitions - 1);
      const alpha = stageFloat - stageIndex;

      const fromShape = shapes[stageIndex];
      const toShape = shapes[stageIndex + 1];
      const fromColor = shapeColors[stageIndex];
      const toColor = shapeColors[stageIndex + 1];

      const posAttr = geometry.attributes.position.array;
      const colAttr = geometry.attributes.color.array;

      for (let i = 0; i < COUNT; i++) {
        const idx = i * 3;

        // Subtle biological breathing noise
        const breath = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.5 + i) * 0.028;

        const x1 = fromShape[idx];
        const y1 = fromShape[idx + 1];
        const z1 = fromShape[idx + 2];

        const x2 = toShape[idx];
        const y2 = toShape[idx + 1];
        const z2 = toShape[idx + 2];

        posAttr[idx] = x1 + (x2 - x1) * alpha + breath;
        posAttr[idx + 1] = y1 + (y2 - y1) * alpha + breath;
        posAttr[idx + 2] = z1 + (z2 - z1) * alpha;

        // Color interpolation
        colAttr[idx] = fromColor[idx] + (toColor[idx] - fromColor[idx]) * alpha;
        colAttr[idx + 1] = fromColor[idx + 1] + (toColor[idx + 1] - fromColor[idx + 1]) * alpha;
        colAttr[idx + 2] = fromColor[idx + 2] + (toColor[idx + 2] - fromColor[idx + 2]) * alpha;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // Subtle ambient stardust rotation
      ambientPoints.rotation.y = elapsed * 0.008;
      ambientPoints.rotation.x = Math.sin(elapsed * 0.005) * 0.01;

      // Ambient glowing prism sprites drifting & pulsing
      spriteMeshes.forEach((sm) => {
        const floatOffset = Math.sin(elapsed * sm.speed + sm.seed) * 0.16;
        const driftOffset = Math.cos(elapsed * (sm.speed * 0.75) + sm.seed) * 0.10;
        sm.sprite.position.y = sm.origY + floatOffset + mouse.y * 0.25;
        sm.sprite.position.x = sm.origX + driftOffset + mouse.x * 0.35;

        const pulse = 1 + Math.sin(elapsed * 1.4 + sm.seed) * 0.05;
        sm.sprite.scale.set(sm.scale * pulse, sm.scale * pulse, 1);
      });

      // Camera subtle float and mouse parallax
      camera.position.x = mouse.x * 0.35;
      camera.position.y = mouse.y * 0.25;
      camera.lookAt(0, 0, 0);

      // Point cloud gentle sway & tilt (bounded parallax - brain stays firmly anchored on the right)
      pointCloud.rotation.y = (mouse.x * 0.07) + Math.sin(elapsed * 0.4) * 0.025;
      pointCloud.rotation.x = (-mouse.y * 0.05) + Math.cos(elapsed * 0.35) * 0.02;

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
      ambientGeometry.dispose();
      ambientMaterial.dispose();
      triangleTexture.dispose();
      prismTextures.forEach((t) => t.dispose());
      spriteMaterials.forEach((sm) => sm.dispose());
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
