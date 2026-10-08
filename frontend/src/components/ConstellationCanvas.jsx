import React, { useEffect, useRef } from 'react';

/**
 * Dala Signature Constellation Canvas
 * Renders thousands of tiny chromatic triangular glyphs forming an organic
 * brain/neural cloud floating against pure black void (#000000).
 */
export default function ConstellationCanvas({ height = 620, interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 700);
    let h = (canvas.height = height);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Dala Palette
    const colors = [
      '#8052ff', // Electric Iris
      '#ffb829', // Saffron Spark
      '#15846e', // Deep Verdant
      '#a855f7', // Vivid Purple
      '#38bdf8', // Cyan Blue
      '#ec4899', // Magenta
      '#ffffff'  // Bone White accent
    ];

    // Particle Structure
    const particles = [];
    const numCore = 380;
    const numAmbient = 140;

    // Center coordinates
    const getCenter = () => ({
      x: width * 0.52,
      y: h * 0.48
    });

    // Helper to draw a tiny outlined triangle
    const drawTriangle = (x, y, size, angle, color, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      const r = size;
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.866, r * 0.5);
      ctx.lineTo(-r * 0.866, r * 0.5);
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };

    // Generate Core Brain Constellation
    for (let i = 0; i < numCore; i++) {
      // Parametric dual-lobe distribution (brain-like silhouette)
      const lobe = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2 * Math.PI;
      const phi = (v - 0.5) * Math.PI;

      // Ellipsoidal distortion
      const rx = 150 + Math.random() * 40;
      const ry = 110 + Math.random() * 30;
      const offsetX = lobe * 45;

      const baseX = Math.cos(theta) * Math.cos(phi) * rx + offsetX;
      const baseY = Math.sin(theta) * ry * 0.85;

      particles.push({
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        size: 3 + Math.random() * 3.5,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: 0.35 + Math.random() * 0.6,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        isAmbient: false
      });
    }

    // Generate Ambient Drifting Particles
    for (let i = 0; i < numAmbient; i++) {
      particles.push({
        baseX: (Math.random() - 0.5) * width * 1.2,
        baseY: (Math.random() - 0.5) * h * 1.1,
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * h * 1.1,
        size: 2.5 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: 0.15 + Math.random() * 0.35,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        driftX: (Math.random() - 0.5) * 0.4,
        driftY: (Math.random() - 0.5) * 0.4,
        isAmbient: true
      });
    }

    // Mouse Interaction
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, h);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      const center = getCenter();

      // Render faint constellation connecting lines between nearest neighbors
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 90; i += 2) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        if (p1 && p2 && !p1.isAmbient && !p2.isAmbient) {
          const x1 = center.x + p1.x;
          const y1 = center.y + p1.y;
          const x2 = center.x + p2.x;
          const y2 = center.y + p2.y;
          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 85) * 0.12;
            ctx.stroke();
          }
        }
      }

      // Render Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.rotSpeed;

        // Breathing oscillation
        const breath = Math.sin(time * 1.5 + p.pulseOffset) * 2;
        p.x = p.baseX + Math.sin(time + p.pulseOffset) * 4 + breath;
        p.y = p.baseY + Math.cos(time * 1.2 + p.pulseOffset) * 4;

        let renderX = center.x + p.x;
        let renderY = center.y + p.y;

        // Mouse displacement effect
        if (interactive && mouse.x > 0) {
          const dx = renderX - mouse.x;
          const dy = renderY - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            renderX += (dx / dist) * force * 24;
            renderY += (dy / dist) * force * 24;
          }
        }

        const alpha = Math.max(
          0.05,
          p.baseAlpha + Math.sin(time * 2 + p.pulseOffset) * 0.2
        );

        drawTriangle(renderX, renderY, p.size, p.angle, p.color, alpha);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [height, interactive]);

  return (
    <div style={{ position: 'relative', width: '100%', height: height, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: height,
          background: 'transparent'
        }}
      />
    </div>
  );
}

