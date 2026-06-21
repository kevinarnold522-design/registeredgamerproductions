import React, { useEffect, useRef } from "react";

export default function ShootingStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Static background stars
    const bgStars = Array.from({ length: 600 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.3,
      alpha: Math.random() * 0.85 + 0.3,
      twinkleSpeed: Math.random() * 0.025 + 0.008,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // Nebula blobs (slow drifting color clouds)
    const nebulas = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 300 + 150,
      color: ["#7c3aed44", "#ec489933", "#06b6d433", "#a855f744", "#6366f133"][Math.floor(Math.random() * 5)],
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
    }));

    // Shooting stars
    const shootingColors = ["#c084fc", "#a855f7", "#9333ea", "#d8b4fe", "#7c3aed", "#e9d5ff"];

    class ShootingStar {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.len = Math.random() * 400 + 180;
        this.speed = Math.random() * 14 + 9;
        this.size = Math.random() * 3 + 1.2;
        this.color = shootingColors[Math.floor(Math.random() * shootingColors.length)];
        this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25;
        this.opacity = Math.random() * 0.5 + 0.7;
        this.waitFrames = initial ? Math.random() * 120 : Math.random() * 90 + 20;
        this.trail = [];
      }
      draw() {
        if (this.waitFrames > 0) { this.waitFrames--; return; }

        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > Math.ceil(this.len / this.speed)) this.trail.shift();

        if (this.trail.length > 1) {
          const tail = this.trail[0];
          const head = this.trail[this.trail.length - 1];
          const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.6, this.color + "55");
          grad.addColorStop(1, this.color);

          ctx.save();
          ctx.globalAlpha = this.opacity;
          ctx.strokeStyle = grad;
          ctx.lineWidth = this.size;
          ctx.shadowBlur = 22;
          ctx.shadowColor = this.color;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          for (const p of this.trail) ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Bright head dot
          ctx.beginPath();
          ctx.arc(head.x, head.y, this.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 30;
          ctx.fill();
          ctx.restore();
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.x > canvas.width + 300 || this.y > canvas.height + 300) {
          this.trail = [];
          this.reset();
        }
      }
    }

    const shootingStars = Array.from({ length: 35 }, () => new ShootingStar());
    let animId;
    let frame = 0;

    const animate = () => {
      frame++;

      // Deep space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.3, canvas.height);
      bgGrad.addColorStop(0, "#050510");
      bgGrad.addColorStop(0.4, "#07051a");
      bgGrad.addColorStop(0.7, "#040312");
      bgGrad.addColorStop(1, "#020208");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulas
      for (const n of nebulas) {
        n.x += n.dx;
        n.y += n.dy;
        if (n.x < -n.r) n.x = canvas.width + n.r;
        if (n.x > canvas.width + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = canvas.height + n.r;
        if (n.y > canvas.height + n.r) n.y = -n.r;

        const radGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        radGrad.addColorStop(0, n.color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw twinkling background stars
      for (const s of bgStars) {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 0.9) s.twinkleDir = -1;
        if (s.alpha <= 0.1) s.twinkleDir = 1;
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = "#e9d5ff";
        ctx.shadowBlur = s.r > 1 ? 8 : 2;
        ctx.shadowColor = "#c084fc";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw shooting stars
      for (const ss of shootingStars) ss.draw();

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
      style={{ zIndex: 0, width: "100vw", height: "100vh" }}
    />
  );
}