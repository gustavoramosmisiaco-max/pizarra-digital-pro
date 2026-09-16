import React, { useEffect, useRef } from 'react';

interface LaserPointerLayerProps {
  isActive: boolean;
}

interface Point {
  x: number;
  y: number;
  time: number;
}

export const LaserPointerLayer: React.FC<LaserPointerLayerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      pointsRef.current = [];
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointsRef.current.push({ x, y, time: Date.now() });
    };

    window.addEventListener('pointermove', handlePointerMove);

    const render = () => {
      const now = Date.now();
      // Keep points within last 800ms
      pointsRef.current = pointsRef.current.filter((p) => now - p.time < 800);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pointsRef.current.length > 1) {
        // Draw laser glowing trail
        for (let i = 1; i < pointsRef.current.length; i++) {
          const p1 = pointsRef.current[i - 1];
          const p2 = pointsRef.current[i];
          const age = now - p2.time;
          const alpha = Math.max(0, 1 - age / 800);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.8})`;
          ctx.lineWidth = 6 * alpha;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }

        // Draw laser dot
        const lastPoint = pointsRef.current[pointsRef.current.length - 1];
        ctx.save();
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 18;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};
