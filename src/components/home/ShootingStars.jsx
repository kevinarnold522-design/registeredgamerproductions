import React, { useEffect, useRef } from "react";

export default function ShootingStars() {
  const canvasRef = useRef(null);
  // Mirror desktop on mobile too — only honor explicit reduced-motion requests.
  const [enabled, setEnabled] = React.useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      // Canvas is position:fixed covering the viewport — sizing to the full
      // scrollable page height wastes huge amounts of fill/draw work and causes lag.
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mobile gets smaller asteroids so they don't crowd the narrow viewport.
    const isMobile = window.innerWidth < 640;
    const astSizeScale = isMobile ? 0.5 : 1;

    // Static background stars
    const bgStars = Array.from({ length: 300 }, () => ({
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
        r: Math.random() * 8 + 6,
        core: p[0], mid: p[1], edge: p[2],
        dx: (Math.random() - 0.5) * 0.12,
        dy: (Math.random() - 0.5) * 0.12,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    // Drifting rockets — classic capsule with fins, porthole & flame
    class Rocket {
      constructor() { this.reset(true); }
      reset(initial = false) {
        // Rockets now LAUNCH UPWARD from below the screen
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.speed = Math.random() * 2.2 + 1.6;
        this.bob = Math.random() * Math.PI * 2;
        this.size = Math.random() * 8 + 14;
        this.sway = Math.random() * 0.6 + 0.4;
        this.variant = Math.floor(Math.random() * 3);
        this.waitFrames = initial ? Math.random() * 400 : Math.random() * 500 + 150;
        this.broken = false;
        this.respawnFrames = 0;
      }
      draw() {
        if (this.broken) {
          this.respawnFrames--;
          if (this.respawnFrames <= 0) this.reset();
          return;
        }
        if (this.waitFrames > 0) { this.waitFrames--; return; }
        this.bob += 0.08;
        const xOff = Math.sin(this.bob) * this.sway * 6;
        const s = this.size;

        ctx.save();
        ctx.translate(this.x + xOff, this.y);
        // Nose points up — slight wobble as it climbs
        ctx.rotate(Math.sin(this.bob) * 0.08);

        // Flame
        const flicker = 0.7 + Math.random() * 0.6;
        const flameGrad = ctx.createLinearGradient(0, s * 0.7, 0, s * (1.4 + flicker));
        flameGrad.addColorStop(0, "#fde68a");
        flameGrad.addColorStop(0.4, "#f59e0b");
        flameGrad.addColorStop(1, "transparent");
        ctx.fillStyle = flameGrad;
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#f97316";
        ctx.beginPath();
        ctx.moveTo(-s * 0.22, s * 0.7);
        ctx.quadraticCurveTo(0, s * (1.5 + flicker * 0.7), s * 0.22, s * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.shadowColor = "#a855f7";
        if (this.variant === 0) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(-s * 0.28, s * 0.4);
          ctx.lineTo(-s * 0.55, s * 0.78);
          ctx.lineTo(-s * 0.28, s * 0.72);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(s * 0.28, s * 0.4);
          ctx.lineTo(s * 0.55, s * 0.78);
          ctx.lineTo(s * 0.28, s * 0.72);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 10;
          ctx.shadowColor = "#c4b5fd";
          ctx.fillStyle = "#f1f5f9";
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.9);
          ctx.quadraticCurveTo(s * 0.32, -s * 0.4, s * 0.28, s * 0.5);
          ctx.lineTo(-s * 0.28, s * 0.5);
          ctx.quadraticCurveTo(-s * 0.32, -s * 0.4, 0, -s * 0.9);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#a855f7";
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.9);
          ctx.quadraticCurveTo(s * 0.18, -s * 0.5, s * 0.1, -s * 0.35);
          ctx.lineTo(-s * 0.1, -s * 0.35);
          ctx.quadraticCurveTo(-s * 0.18, -s * 0.5, 0, -s * 0.9);
          ctx.closePath();
          ctx.fill();
        } else if (this.variant === 1) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(-s * 0.4, s * 0.34, s * 0.16, s * 0.34);
          ctx.fillRect(s * 0.24, s * 0.34, s * 0.16, s * 0.34);
          ctx.fillStyle = "#e2e8f0";
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.22);
          ctx.lineTo(s * 0.3, s * 0.56);
          ctx.lineTo(-s * 0.3, s * 0.56);
          ctx.lineTo(-s * 0.3, -s * 0.22);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-s * 0.18, -s * 0.44, s * 0.36, s * 0.18);
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.15, -s * 0.56);
          ctx.lineTo(-s * 0.15, -s * 0.56);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = "#fb7185";
          ctx.beginPath();
          ctx.moveTo(-s * 0.18, s * 0.26);
          ctx.lineTo(-s * 0.56, s * 0.72);
          ctx.lineTo(-s * 0.08, s * 0.58);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(s * 0.18, s * 0.26);
          ctx.lineTo(s * 0.56, s * 0.72);
          ctx.lineTo(s * 0.08, s * 0.58);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#d946ef";
          ctx.fillRect(-s * 0.14, s * 0.46, s * 0.28, s * 0.18);
          ctx.fillStyle = "#e5e7eb";
          ctx.beginPath();
          ctx.ellipse(0, -s * 0.12, s * 0.3, s * 0.72, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.ellipse(0, -s * 0.68, s * 0.12, s * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Porthole
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#22d3ee";
        ctx.fillStyle = "#0e7490";
        ctx.beginPath();
        ctx.arc(0, -s * 0.05, s * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a5f3fc";
        ctx.beginPath();
        ctx.arc(0, -s * 0.05, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.y -= this.speed;
        if (this.y < -120) this.reset();
      }
    }
    const rockets = Array.from({ length: 3 }, () => new Rocket());

    // Mini floating astronauts — slow drift + gentle spin
    class Astronaut {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -40;
        this.dx = (Math.random() - 0.5) * 0.5;
        this.dy = Math.random() * 0.4 + 0.15;
        this.size = Math.random() * 5 + 9;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.01;
        this.bob = Math.random() * Math.PI * 2;
        // Not every astronaut needs a balloon — some float without one.
        this.hasBalloon = Math.random() > 0.35;
        const balloonColors = ["#f472b6", "#f87171", "#facc15", "#4ade80", "#60a5fa", "#c084fc"];
        this.balloonColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        // Most astronauts wear a WHITE suit; accent color used for helmet trim + stripes
        const accentColors = ["#f87171", "#fbbf24", "#4ade80", "#60a5fa", "#c084fc", "#f472b6", "#22d3ee", "#fb923c"];
        this.suitColor = "#f1f5f9";
        this.accentColor = accentColors[Math.floor(Math.random() * accentColors.length)];
        this.broken = false;
        this.respawnFrames = 0;
      }
      draw() {
        if (this.broken) {
          this.respawnFrames--;
          if (this.respawnFrames <= 0) this.reset();
          return;
        }
        this.bob += 0.04;
        this.angle += this.spin;
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bob) * 4);

        // Balloon (drawn upright, before the astronaut tumble-rotation)
        if (this.hasBalloon) {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.balloonColor;
          // String
          ctx.strokeStyle = "rgba(226,232,240,0.7)";
          ctx.lineWidth = s * 0.05;
          ctx.beginPath();
          ctx.moveTo(s * 0.5, -s * 0.2);
          ctx.quadraticCurveTo(s * 0.9, -s * 1.0, s * 0.8, -s * 1.7);
          ctx.stroke();
          // Balloon body
          ctx.fillStyle = this.balloonColor;
          ctx.beginPath();
          ctx.ellipse(s * 0.8, -s * 2.0, s * 0.45, s * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          // Highlight
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.beginPath();
          ctx.ellipse(s * 0.68, -s * 2.15, s * 0.13, s * 0.18, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.rotate(this.angle + Math.sin(this.bob) * 0.1);
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#a855f7";

        // Backpack
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(-s * 0.5, -s * 0.35, s * 0.35, s * 0.8, s * 0.1);
        ctx.fill();

        // Body suit (white)
        ctx.fillStyle = this.suitColor;
        ctx.beginPath();
        ctx.roundRect(-s * 0.28, -s * 0.3, s * 0.56, s * 0.75, s * 0.18);
        ctx.fill();
        // Colored chest stripe
        ctx.fillStyle = this.accentColor;
        ctx.beginPath();
        ctx.roundRect(-s * 0.28, s * 0.02, s * 0.56, s * 0.1, s * 0.04);
        ctx.fill();

        // Arms (white with colored cuffs)
        ctx.strokeStyle = this.suitColor;
        ctx.lineWidth = s * 0.18;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, -s * 0.05);
        ctx.lineTo(-s * 0.55, s * 0.2);
        ctx.moveTo(s * 0.25, -s * 0.05);
        ctx.lineTo(s * 0.55, -s * 0.25);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, s * 0.45);
        ctx.lineTo(-s * 0.22, s * 0.75);
        ctx.moveTo(s * 0.1, s * 0.45);
        ctx.lineTo(s * 0.25, s * 0.72);
        ctx.stroke();

        // Helmet (white shell, colored trim ring)
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(0, -s * 0.5, s * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = s * 0.06;
        ctx.beginPath();
        ctx.arc(0, -s * 0.5, s * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        // Visor
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.accentColor;
        ctx.fillStyle = "#155e75";
        ctx.beginPath();
        ctx.arc(0, -s * 0.5, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#a5f3fc";
        ctx.beginPath();
        ctx.arc(s * 0.06, -s * 0.55, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.x += this.dx;
        this.y += this.dy;
        if (this.y > canvas.height + 60 || this.x < -60 || this.x > canvas.width + 60) this.reset();
      }
    }
    const astronauts = Array.from({ length: 7 }, () => new Astronaut());

    // Spark bursts emitted when two asteroids clash
    const sparks = [];
    const asteroidParticles = [];
    function spawnSparks(x, y, count = 14) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 3 + 1;
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: Math.random() * 0.04 + 0.02,
          color: ["#fde68a", "#fb923c", "#f87171", "#fcd34d"][Math.floor(Math.random() * 4)],
          r: Math.random() * 1.6 + 0.6,
        });
      }
    }

    function spawnAsteroidParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 2.6 + 0.8;
        asteroidParticles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: Math.random() * 0.025 + 0.012,
          color,
          // Tiny rock shard — irregular chunk that tumbles as it flies off
          r: Math.random() * 3.2 + 1.2,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.4,
          shard: Math.floor(Math.random() * 3),
        });
      }
    }

    // Colorful fireball explosion — emitted when a shooting star hits an object
    const explosions = [];
    function spawnExplosion(x, y, count = 30) {
      const colors = ["#fde68a", "#fb923c", "#f87171", "#fcd34d", "#22d3ee", "#a855f7", "#f472b6", "#ffffff"];
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 5 + 1.5;
        explosions.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: Math.random() * 0.03 + 0.015,
          color: colors[Math.floor(Math.random() * colors.length)],
          r: Math.random() * 3 + 1.5,
        });
      }
      // Bright central flash
      explosions.push({ x, y, vx: 0, vy: 0, life: 1, decay: 0.06, color: "#ffffff", r: 16, flash: true });
    }
    function drawExplosions() {
      for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.93; p.vy *= 0.93;
        p.life -= p.decay;
        if (p.life <= 0) { explosions.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.flash ? 30 : 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.flash ? p.r * p.life : p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Mini asteroids — irregular rocky chunks drifting & colliding in space.
    // Varied sizes (small pebbles to large boulders) that physically clash.
    class Asteroid {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.broken = false;
        this.respawnFrames = 0;
        // Smaller size range — tiny pebbles to small rocks (even smaller on mobile)
        this.size = (Math.random() * 11 + 3) * astSizeScale;
        this.mass = this.size * this.size;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        if (initial !== true && Math.random() > 0.5) {
          this.fromLeft = Math.random() > 0.5;
          this.x = this.fromLeft ? -50 : canvas.width + 50;
          this.y = Math.random() * canvas.height;
        }
        const speed = Math.random() * 0.6 + 0.25;
        const dir = Math.random() * Math.PI * 2;
        this.dx = Math.cos(dir) * speed;
        this.dy = Math.sin(dir) * speed;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.04;
        // Oblong/elliptical squash so rocks look rounded but stretched
        this.stretchX = 1 + Math.random() * 0.6;
        this.stretchY = 1 - Math.random() * 0.35;
        // Pre-generate a smooth, mostly-round rocky outline (low variance = circular)
        this.verts = Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const rad = 1 + (Math.random() - 0.5) * 0.16;
          return { x: Math.cos(a) * rad, y: Math.sin(a) * rad };
        });
        // Grey rock tones
        const shades = ["#9ca3af", "#6b7280", "#71717a", "#52525b", "#a1a1aa"];
        this.color = shades[Math.floor(Math.random() * shades.length)];
        this.flash = 0;
        this.broken = false;
        this.respawnFrames = 0;
      }
      draw() {
        // When broken, stay invisible and count down to respawn somewhere else
        if (this.broken) {
          this.respawnFrames--;
          if (this.respawnFrames <= 0) this.reset();
          return;
        }
        this.angle += this.spin;
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.stretchX, this.stretchY);
        ctx.shadowBlur = this.flash > 0 ? 16 : 6;
        ctx.shadowColor = this.flash > 0 ? "#e5e7eb" : "#9ca3af";
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Smooth rounded outline through the vertices
        this.verts.forEach((v, i) => {
          const px = v.x * s, py = v.y * s;
          const next = this.verts[(i + 1) % this.verts.length];
          const nx = next.x * s, ny = next.y * s;
          if (i === 0) ctx.moveTo((px + nx) / 2, (py + ny) / 2);
          else ctx.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2);
        });
        ctx.closePath();
        ctx.fill();
        // Craters
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.arc(-s * 0.25, s * 0.1, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * 0.3, -s * 0.2, s * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.flash > 0) this.flash--;
        this.x += this.dx;
        this.y += this.dy;
        // Wrap around the screen edges so they keep clashing
        const m = s + 10;
        if (this.x < -m) this.x = canvas.width + m;
        if (this.x > canvas.width + m) this.x = -m;
        if (this.y < -m) this.y = canvas.height + m;
        if (this.y > canvas.height + m) this.y = -m;
      }
    }
    const asteroids = Array.from({ length: 16 }, () => new Asteroid());

    // Elastic collision resolution between asteroids — makes them clash
    function resolveAsteroidCollisions() {
      for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
          const a = asteroids[i], b = asteroids[j];
          if (a.broken || b.broken) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.size + b.size;
          if (dist > 0 && dist < minDist) {
            // Normalized collision axis
            const nx = dx / dist, ny = dy / dist;
            // Relative velocity along the normal
            const rvx = a.dx - b.dx, rvy = a.dy - b.dy;
            const vn = rvx * nx + rvy * ny;
            if (vn > 0) {
              const imp = (2 * vn) / (a.mass + b.mass);
              a.dx -= imp * b.mass * nx;
              a.dy -= imp * b.mass * ny;
              b.dx += imp * a.mass * nx;
              b.dy += imp * a.mass * ny;
            }
            // Separate so they don't overlap/stick
            const overlap = (minDist - dist) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const impactX = a.x + nx * a.size;
            const impactY = a.y + ny * a.size;
            const impactBX = b.x - nx * b.size;
            const impactBY = b.y - ny * b.size;
            // Shatter BOTH asteroids into rock fragments — they break apart, not stay intact
            spawnAsteroidParticles(a.x, a.y, a.color, Math.max(16, Math.round(a.size * 1.8)));
            spawnAsteroidParticles(b.x, b.y, b.color, Math.max(16, Math.round(b.size * 1.8)));
            spawnSparks(impactX, impactY, 24);
            a.broken = true; b.broken = true;
            a.respawnFrames = 140 + Math.floor(Math.random() * 180);
            b.respawnFrames = 140 + Math.floor(Math.random() * 180);
          }
        }
      }
    }

    function drawAsteroidParticles() {
      for (let i = asteroidParticles.length - 1; i >= 0; i--) {
        const p = asteroidParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= p.decay;
        if (p.life <= 0) {
          asteroidParticles.splice(i, 1);
          continue;
        }
        p.angle = (p.angle || 0) + (p.spin || 0);
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        // Jagged little rock fragment
        ctx.beginPath();
        const r = p.r;
        if (p.shard === 0) {
          ctx.moveTo(-r, -r * 0.6); ctx.lineTo(r * 0.8, -r); ctx.lineTo(r, r * 0.7); ctx.lineTo(-r * 0.5, r);
        } else if (p.shard === 1) {
          ctx.moveTo(-r, 0); ctx.lineTo(0, -r); ctx.lineTo(r, r * 0.3); ctx.lineTo(0, r);
        } else {
          ctx.moveTo(-r * 0.7, -r); ctx.lineTo(r, -r * 0.4); ctx.lineTo(r * 0.5, r); ctx.lineTo(-r, r * 0.6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Background spaceships — sleek UFO-style saucers gliding by
    class Spaceship {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.fromLeft = Math.random() > 0.5;
        this.x = this.fromLeft ? -120 : canvas.width + 120;
        this.y = Math.random() * canvas.height * 0.85;
        this.speed = (Math.random() * 1 + 0.6) * (this.fromLeft ? 1 : -1);
        this.bob = Math.random() * Math.PI * 2;
        this.size = Math.random() * 10 + 16;
        this.waitFrames = initial ? Math.random() * 300 : Math.random() * 500 + 150;
        const glows = ["#22d3ee", "#a855f7", "#34d399", "#f472b6"];
        this.glow = glows[Math.floor(Math.random() * glows.length)];
      }
      draw() {
        if (this.waitFrames > 0) { this.waitFrames--; return; }
        this.bob += 0.04;
        const s = this.size;
        const yOff = Math.sin(this.bob) * 5;
        ctx.save();
        ctx.translate(this.x, this.y + yOff);

        // Under-glow beam
        const beam = ctx.createRadialGradient(0, s * 0.5, 0, 0, s * 0.5, s * 1.6);
        beam.addColorStop(0, this.glow + "66");
        beam.addColorStop(1, "transparent");
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.ellipse(0, s * 0.6, s * 1.4, s * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Saucer body
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.glow;
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dome
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(0, -s * 0.1, s * 0.42, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = this.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -s * 0.12, s * 0.26, Math.PI, 0);
        ctx.fill();

        // Blinking lights
        const blink = Math.sin(this.bob * 3) > 0 ? 1 : 0.3;
        ctx.globalAlpha = blink;
        ctx.fillStyle = this.glow;
        [-0.6, -0.2, 0.2, 0.6].forEach((p) => {
          ctx.beginPath();
          ctx.arc(s * p, s * 0.12, s * 0.07, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Tethered astronaut dangling below the saucer
        const sway = Math.sin(this.bob * 1.3) * s * 0.5;
        const tetherX = sway;
        const tetherY = s * 2.6;
        // Tether line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(226,232,240,0.6)";
        ctx.lineWidth = Math.max(1, s * 0.04);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.2);
        ctx.quadraticCurveTo(tetherX * 0.4, s * 1.4, tetherX, tetherY);
        ctx.stroke();
        // Mini astronaut
        const a = s * 0.32;
        ctx.save();
        ctx.translate(tetherX, tetherY);
        ctx.rotate(sway * 0.06);
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#a855f7";
        // Backpack
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(-a * 0.5, -a * 0.35, a * 0.35, a * 0.8, a * 0.1);
        ctx.fill();
        // Body
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.roundRect(-a * 0.28, -a * 0.3, a * 0.56, a * 0.75, a * 0.18);
        ctx.fill();
        // Arms + legs
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = a * 0.18;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-a * 0.25, -a * 0.05); ctx.lineTo(-a * 0.55, a * 0.2);
        ctx.moveTo(a * 0.25, -a * 0.05); ctx.lineTo(a * 0.55, -a * 0.2);
        ctx.moveTo(-a * 0.1, a * 0.45); ctx.lineTo(-a * 0.22, a * 0.75);
        ctx.moveTo(a * 0.1, a * 0.45); ctx.lineTo(a * 0.25, a * 0.72);
        ctx.stroke();
        // Helmet + visor
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath(); ctx.arc(0, -a * 0.5, a * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 5; ctx.shadowColor = "#22d3ee";
        ctx.fillStyle = "#155e75";
        ctx.beginPath(); ctx.arc(0, -a * 0.5, a * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#a5f3fc";
        ctx.beginPath(); ctx.arc(a * 0.06, -a * 0.55, a * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.restore();

        this.x += this.speed;
        if (this.x < -200 || this.x > canvas.width + 200) this.reset();
      }
    }
    const spaceships = Array.from({ length: 3 }, () => new Spaceship());

    // Colored small stars — twinkling dots in varied hues
    const starColors = ["#67e8f9", "#fca5a5", "#fde68a", "#86efac", "#f0abfc", "#93c5fd"];
    const colorStars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // Moons — different shapes: full, crescent, gibbous, half
    class Moon {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = (Math.random() - 0.5) * 0.18;
        this.dy = (Math.random() - 0.5) * 0.18;
        this.size = Math.random() * 7 + 5;
        this.shape = ["full", "crescent", "gibbous", "half"][Math.floor(Math.random() * 4)];
        const tones = ["#e2e8f0", "#fcd34d", "#cbd5e1", "#fed7aa", "#d1d5db"];
        this.color = tones[Math.floor(Math.random() * tones.length)];
        this.glow = ["#fde68a", "#c4b5fd", "#a5f3fc"][Math.floor(Math.random() * 3)];
      }
      draw() {
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.glow;
        // Base disc
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();

        // Carve the shape with a shadow-colored overlay
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(5,5,16,0.92)";
        if (this.shape === "crescent") {
          ctx.beginPath();
          ctx.arc(s * 0.5, 0, s * 0.95, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === "half") {
          ctx.beginPath();
          ctx.rect(0, -s, s, s * 2);
          ctx.fill();
        } else if (this.shape === "gibbous") {
          ctx.beginPath();
          ctx.arc(s * 0.85, 0, s * 0.85, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // full moon — add craters
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.2, s * 0.22, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(s * 0.25, s * 0.3, s * 0.16, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(s * 0.1, -s * 0.4, s * 0.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        this.x += this.dx;
        this.y += this.dy;
        if (this.x < -s) this.x = canvas.width + s;
        if (this.x > canvas.width + s) this.x = -s;
        if (this.y < -s) this.y = canvas.height + s;
        if (this.y > canvas.height + s) this.y = -s;
      }
    }
    const moons = Array.from({ length: 4 }, () => new Moon());

    // Mini planets — colorful orbs, some ringed
    class Planet {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = (Math.random() - 0.5) * 0.22;
        this.dy = (Math.random() - 0.5) * 0.22;
        this.size = Math.random() * 9 + 6;
        const palettes = [
          ["#f97316", "#7c2d12"], ["#22d3ee", "#155e75"], ["#a855f7", "#581c87"],
          ["#34d399", "#065f46"], ["#f472b6", "#831843"], ["#facc15", "#854d0e"],
        ];
        const p = palettes[Math.floor(Math.random() * palettes.length)];
        this.core = p[0]; this.edge = p[1];
        this.hasRing = Math.random() < 0.45;
        this.ringAngle = (Math.random() - 0.5) * 0.8;
      }
      draw() {
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Ring behind
        if (this.hasRing) {
          ctx.save();
          ctx.rotate(this.ringAngle);
          ctx.strokeStyle = this.core + "aa";
          ctx.lineWidth = s * 0.18;
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.core;
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 1.7, s * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Planet body with shaded gradient
        const grad = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.2, 0, 0, s);
        grad.addColorStop(0, this.core);
        grad.addColorStop(1, this.edge);
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.core;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.x += this.dx;
        this.y += this.dy;
        if (this.x < -s * 2) this.x = canvas.width + s * 2;
        if (this.x > canvas.width + s * 2) this.x = -s * 2;
        if (this.y < -s * 2) this.y = canvas.height + s * 2;
        if (this.y > canvas.height + s * 2) this.y = -s * 2;
      }
    }
    const planets = Array.from({ length: 5 }, () => new Planet());

    // Shooting stars — varied vivid colors (not just purple)
    const shootingColors = ["#c084fc", "#22d3ee", "#34d399", "#f472b6", "#fde68a", "#60a5fa", "#fb923c", "#f87171", "#a855f7", "#e9d5ff"];

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

    const shootingStars = Array.from({ length: 18 }, () => new ShootingStar());

    // When a shooting star's head touches an asteroid / rocket / astronaut, it explodes.
    function resolveShootingStarHits() {
      for (const ss of shootingStars) {
        if (ss.waitFrames > 0 || ss.trail.length < 2) continue;
        const hx = ss.x, hy = ss.y;
        const hit = (obj, radius) => {
          if (obj.broken || obj.waitFrames > 0) return false;
          return Math.hypot(obj.x - hx, obj.y - hy) < radius + ss.size * 2;
        };
        for (const obj of asteroids) {
          if (hit(obj, obj.size)) {
            spawnExplosion(obj.x, obj.y, 34);
            spawnAsteroidParticles(obj.x, obj.y, obj.color, 18);
            obj.broken = true; obj.respawnFrames = 150 + Math.floor(Math.random() * 160);
            ss.trail = []; ss.reset();
            break;
          }
        }
        for (const obj of rockets) {
          if (hit(obj, obj.size)) {
            spawnExplosion(obj.x, obj.y, 40);
            obj.broken = true; obj.respawnFrames = 200 + Math.floor(Math.random() * 200);
            ss.trail = []; ss.reset();
            break;
          }
        }
        for (const obj of astronauts) {
          if (hit(obj, obj.size)) {
            spawnExplosion(obj.x, obj.y, 32);
            obj.broken = true; obj.respawnFrames = 180 + Math.floor(Math.random() * 180);
            ss.trail = []; ss.reset();
            break;
          }
        }
      }
    }

    let animId;
    let frame = 0;

    const animate = () => {
      frame++;

      // Deep space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.3, canvas.height);
      bgGrad.addColorStop(0, "#1a1340");
      bgGrad.addColorStop(0.4, "#241a52");
      bgGrad.addColorStop(0.7, "#1c1342");
      bgGrad.addColorStop(1, "#150e36");
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

      // Draw twinkling colored stars
      for (const cs of colorStars) {
        cs.alpha += cs.twinkleSpeed * cs.twinkleDir;
        if (cs.alpha >= 0.95) cs.twinkleDir = -1;
        if (cs.alpha <= 0.2) cs.twinkleDir = 1;
        ctx.save();
        ctx.globalAlpha = cs.alpha;
        ctx.fillStyle = cs.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = cs.color;
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, cs.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw moons
      for (const m of moons) m.draw();

      // Draw mini planets
      for (const pl of planets) pl.draw();

      // Draw mini asteroids — resolve clashes, render, then spark bursts
      resolveAsteroidCollisions();
      drawAsteroidParticles();
      for (const ast of asteroids) ast.draw();
      drawSparks();

      // Draw background spaceships
      for (const sp of spaceships) sp.draw();

      // Draw shooting stars
      for (const ss of shootingStars) ss.draw();

      // Draw rockets
      for (const r of rockets) r.draw();

      // Draw floating astronauts
      for (const a of astronauts) a.draw();

      // Detect shooting-star impacts and render the resulting explosions
      resolveShootingStarHits();
      drawExplosions();

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
}