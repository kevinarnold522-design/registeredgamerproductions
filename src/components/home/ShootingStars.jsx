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

    // Glowing suns (large radiant orbs drifting slowly)
    const suns = Array.from({ length: 3 }, () => {
      const palettes = [
        ["#fde68a", "#f59e0b", "#b45309"],
        ["#fca5a5", "#ef4444", "#7f1d1d"],
        ["#c4b5fd", "#8b5cf6", "#4c1d95"],
      ];
      const p = palettes[Math.floor(Math.random() * palettes.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 70 + 50,
        core: p[0], mid: p[1], edge: p[2],
        dx: (Math.random() - 0.5) * 0.12,
        dy: (Math.random() - 0.5) * 0.12,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    // Drifting rockets
    class Rocket {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.fromLeft = Math.random() > 0.5;
        this.x = this.fromLeft ? -80 : canvas.width + 80;
        this.y = Math.random() * canvas.height;
        this.speed = (Math.random() * 1.2 + 0.8) * (this.fromLeft ? 1 : -1);
        this.bob = Math.random() * Math.PI * 2;
        this.size = Math.random() * 10 + 16;
        this.waitFrames = initial ? Math.random() * 400 : Math.random() * 600 + 200;
      }
      draw() {
        if (this.waitFrames > 0) { this.waitFrames--; return; }
        this.bob += 0.05;
        const yOff = Math.sin(this.bob) * 8;
        const px = this.x;
        const py = this.y + yOff;
        const s = this.size;
        const facingRight = this.speed > 0;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(facingRight ? 0.35 : -0.35 + Math.PI);

        // Flame trail
        const flameGrad = ctx.createLinearGradient(-s * 1.6, 0, -s * 0.5, 0);
        flameGrad.addColorStop(0, "transparent");
        flameGrad.addColorStop(0.5, "#f59e0b");
        flameGrad.addColorStop(1, "#fde68a");
        ctx.fillStyle = flameGrad;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s * 0.18);
        ctx.lineTo(-s * (1.3 + Math.random() * 0.5), 0);
        ctx.lineTo(-s * 0.5, s * 0.18);
        ctx.closePath();
        ctx.fill();

        // Body
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#a855f7";
        ctx.fillStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.moveTo(s * 0.7, 0);
        ctx.lineTo(-s * 0.4, -s * 0.3);
        ctx.lineTo(-s * 0.4, s * 0.3);
        ctx.closePath();
        ctx.fill();

        // Nose
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.moveTo(s * 0.7, 0);
        ctx.lineTo(s * 0.2, -s * 0.18);
        ctx.lineTo(s * 0.2, s * 0.18);
        ctx.closePath();
        ctx.fill();

        // Window
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#22d3ee";
        ctx.fillStyle = "#67e8f9";
        ctx.beginPath();
        ctx.arc(s * 0.05, 0, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.x += this.speed;
        if (this.x < -150 || this.x > canvas.width + 150) this.reset();
      }
    }
    const rockets = Array.from({ length: 4 }, () => new Rocket());

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

      // Draw glowing suns
      for (const sun of suns) {
        sun.x += sun.dx;
        sun.y += sun.dy;
        sun.pulse += 0.015;
        if (sun.x < -sun.r) sun.x = canvas.width + sun.r;
        if (sun.x > canvas.width + sun.r) sun.x = -sun.r;
        if (sun.y < -sun.r) sun.y = canvas.height + sun.r;
        if (sun.y > canvas.height + sun.r) sun.y = -sun.r;
        const pulseR = sun.r * (1 + Math.sin(sun.pulse) * 0.06);
        const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, pulseR * 2.4);
        glow.addColorStop(0, sun.core);
        glow.addColorStop(0.18, sun.mid);
        glow.addColorStop(0.5, sun.edge + "66");
        glow.addColorStop(1, "transparent");
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, pulseR * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = sun.core;
        ctx.shadowBlur = 40;
        ctx.shadowColor = sun.mid;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, pulseR * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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

      // Draw rockets
      for (const r of rockets) r.draw();

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
      style={{ zIndex: 1, width: "100vw", height: "100vh" }}
    />
  );
}