import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    let animId;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
        ctx.fill();
      }
    }

    const count = Math.min(Math.floor((w * h) / 12000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 0, 0, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed rounded-full pointer-events-none z-0" style={{
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(0,0,0,0.03), transparent)",
        top: "-10%", left: "-5%",
        animation: "floatGlow 12s ease-in-out infinite alternate"
      }} />
      <div className="fixed rounded-full pointer-events-none z-0" style={{
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,0,0,0.02), transparent)",
        bottom: "-5%", right: "-5%",
        animation: "floatGlow 15s ease-in-out infinite alternate-reverse"
      }} />
      <div className="fixed rounded-full pointer-events-none z-0" style={{
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(0,0,0,0.015), transparent)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        animation: "floatGlow 18s ease-in-out infinite alternate"
      }} />
    </>
  );
}