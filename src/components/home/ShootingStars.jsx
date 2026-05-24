import React, { useEffect, useRef } from "react";

export default function ShootingStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#6366f1"];

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.6;
        this.len = Math.random() * 180 + 80;
        this.speed = Math.random() * 6 + 3;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.active = false;
        this.waitFrames = Math.random() * 200;
      }
      draw() {
        if (this.waitFrames > 0) { this.waitFrames--; return; }
        this.active = true;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const tailX = this.x - Math.cos(this.angle) * this.len;
        const tailY = this.y - Math.sin(this.angle) * this.len;
        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, this.color);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.x > canvas.width + 200 || this.y > canvas.height + 200) this.reset();
      }
    }

    const stars = Array.from({ length: 18 }, () => new Star());
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => s.draw());
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.55, zIndex: 1 }}
    />
  );
}