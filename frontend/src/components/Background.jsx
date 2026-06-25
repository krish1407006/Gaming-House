import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, crystals = [];
    let animId;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function generateCrystalShape(baseRadius) {
      const points = [];
      const count = Math.floor(Math.random() * 5) + 7;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = baseRadius * (0.5 + Math.random() * 0.6);
        points.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r * (0.6 + Math.random() * 0.4)
        });
      }
      return points;
    }

    function getFacetShade() {
      const g = Math.floor(Math.random() * 60 + 20);
      return `rgb(${g}, ${g}, ${g})`;
    }

    class Crystal {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 60 + 25;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.shape = generateCrystalShape(this.size);
        this.facetColor = getFacetShade();
        this.outlineColor = `rgb(10, 10, 10)`;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.005 + Math.random() * 0.01;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.pulse += this.pulseSpeed;

        if (this.x < -100) this.x = w + 100;
        if (this.x > w + 100) this.x = -100;
        if (this.y < -100) this.y = h + 100;
        if (this.y > h + 100) this.y = -100;
      }
      draw() {
        const scale = 1 + Math.sin(this.pulse) * 0.05;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = this.opacity;

        const pts = this.shape;

        // Draw main crystal body with gradient
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = this.facetColor;
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw internal facet lines (from center-ish to edges)
        const cx = 0, cy = 0;
        for (let i = 0; i < pts.length; i++) {
          const next = (i + 1) % pts.length;
          const midX = (pts[i].x + pts[next].x) / 2;
          const midY = (pts[i].y + pts[next].y) / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(midX, midY);
          ctx.strokeStyle = `rgba(0, 0, 0, 0.25)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw some cross facets for crystal look
        for (let i = 0; i < pts.length; i += 2) {
          const next = (i + 3) % pts.length;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[next].x, pts[next].y);
          ctx.strokeStyle = `rgba(0, 0, 0, 0.12)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Small shine highlight
        const shineX = this.size * 0.15;
        const shineY = -this.size * 0.2;
        ctx.beginPath();
        ctx.arc(shineX, shineY, this.size * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.25)`;
        ctx.fill();

        ctx.restore();
      }
    }

    const count = Math.min(Math.floor((w * h) / 150000), 20);
    for (let i = 0; i < count; i++) crystals.push(new Crystal());

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      crystals.forEach(c => { c.update(); c.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
  );
}
