import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const GeometricTrianglesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates and radius of influence
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 200,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initPoints();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Points / Vertices collection
    let points: Point[] = [];
    const POINT_COUNT = Math.min(85, Math.floor((width * height) / 14000) + 30);
    const MAX_DISTANCE = 160; // Max line connection distance between nodes
    const TRIANGLE_MAX_DIST = 145; // Max distance to form filled triangles

    const colors = [
      'rgba(59, 130, 246, ',   // blue-500
      'rgba(99, 102, 241, ',   // indigo-500
      'rgba(14, 165, 233, ',   // sky-500
      'rgba(139, 92, 246, ',   // purple-500
    ];

    const initPoints = () => {
      points = [];
      const count = Math.min(90, Math.floor((width * height) / 13000) + 30);
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.75,
          vy: (Math.random() - 0.5) * 0.75,
          radius: Math.random() * 2.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initPoints();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update points position and mouse physics
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Move by velocity
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Mouse attraction / gentle interaction
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius && distMouse > 0) {
          const force = (1 - distMouse / mouse.radius) * 0.6;
          p.x += (dxMouse / distMouse) * force * 2;
          p.y += (dyMouse / distMouse) * force * 2;
        }
      }

      // 2. Draw Triangles between closest triplets of points (and mouse)
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist12 = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist12 < TRIANGLE_MAX_DIST) {
            for (let k = j + 1; k < points.length; k++) {
              const p3 = points[k];
              const dist23 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
              const dist13 = Math.hypot(p1.x - p3.x, p1.y - p3.y);

              if (dist23 < TRIANGLE_MAX_DIST && dist13 < TRIANGLE_MAX_DIST) {
                // Calculate average distance to mouse to enhance when user hovers nearby
                const centroidX = (p1.x + p2.x + p3.x) / 3;
                const centroidY = (p1.y + p2.y + p3.y) / 3;
                const mouseDist = Math.hypot(mouse.x - centroidX, mouse.y - centroidY);

                let alpha = (1 - Math.max(dist12, dist23, dist13) / TRIANGLE_MAX_DIST) * 0.08;

                // If close to cursor, highlight triangles and connect them more vibrantly
                if (mouseDist < mouse.radius) {
                  alpha += (1 - mouseDist / mouse.radius) * 0.22;
                }

                if (alpha > 0.01) {
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.lineTo(p3.x, p3.y);
                  ctx.closePath();
                  ctx.fillStyle = `rgba(59, 130, 246, ${Math.min(0.28, alpha)})`;
                  ctx.fill();
                  
                  // Optional delicate triangle border
                  if (alpha > 0.1) {
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.7})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                  }
                }
              }
            }
          }
        }
      }

      // 3. Draw Connecting Lines between close points
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < MAX_DISTANCE) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const mouseDist = Math.hypot(mouse.x - midX, mouse.y - midY);

            let alpha = (1 - dist / MAX_DISTANCE) * 0.25;
            if (mouseDist < mouse.radius) {
              alpha += (1 - mouseDist / mouse.radius) * 0.45;
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${Math.min(0.7, alpha)})`;
            ctx.lineWidth = mouseDist < mouse.radius ? 1.2 : 0.6;
            ctx.stroke();
          }
        }

        // Draw Line from Point to Mouse if within radius
        const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
        if (distToMouse < mouse.radius) {
          const alpha = (1 - distToMouse / mouse.radius) * 0.55;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }

      // 4. Draw Individual Geometric Nodes (points)
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const isHovered = distToMouse < mouse.radius;

        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? p.radius * 1.5 : p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#2563EB' : `${p.color}0.75)`;
        ctx.fill();

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
