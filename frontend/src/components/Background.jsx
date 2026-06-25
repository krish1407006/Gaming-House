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
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.15;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -50 || this.x > w + 50 || this.y < -50 || this.y > h + 50) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * (1 - dist / 150)})`;
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
      <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 top-[-10%] left-[-5%]" style={{
        background: "radial-gradient(circle, rgba(0,212,255,0.2), transparent)",
        filter: "blur(80px)",
        animation: "floatGlow 12s ease-in-out infinite alternate"
      }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 bottom-[-5%] right-[-5%]" style={{
        background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent)",
        filter: "blur(80px)",
        animation: "floatGlow 15s ease-in-out infinite alternate-reverse"
      }} />
      <div className="fixed w-[350px] h-[350px] rounded-full pointer-events-none z-0 top-[40%] left-[60%]" style={{
        background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent)",
        filter: "blur(80px)",
        animation: "floatGlow 18s ease-in-out infinite alternate"
      }} />
    </>
  );
}
