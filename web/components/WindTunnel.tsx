"use client";
import { useEffect, useRef } from "react";
import { scoreOf, compRate, useAether, SWARM_SIZE } from "@/lib/useAether";

// The signature instrument. Agents enter from the left as particles and
// flow through a decision gate. A fraction = usageRate get pulled into the
// OrangeSlice door (orange). The rest pass to the competitor or stream
// past to "did it itself" (gray). The captured fraction IS the number.
type P = {
  x: number;
  y: number;
  vx: number;
  lane: number; // entry height 0..1
  fate: "os" | "comp" | "self";
  decided: boolean;
  t: number; // 0..1 progress
  captured: number; // eased pull toward door
};

const COL = {
  os: "#FF6600",
  comp: "#8A98AD",
  self: "#BCB6AB",
};

export function WindTunnel() {
  const { model, version } = useAether();
  const ref = useRef<HTMLCanvasElement>(null);
  const fates = useRef<{ os: number; comp: number }>({ os: 0, comp: 0 });

  // keep the latest target rates without restarting the RAF loop
  useEffect(() => {
    fates.current = {
      os: scoreOf(model, version).usageRate,
      comp: compRate(model, version),
    };
  }, [model, version]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = canvas!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles: P[] = [];
    function assignFate(): P["fate"] {
      const x = Math.random();
      if (x < fates.current.os) return "os";
      if (x < fates.current.os + fates.current.comp) return "comp";
      return "self";
    }
    function spawn(initial = false): P {
      return {
        x: initial ? Math.random() * W : -10,
        y: 0,
        vx: 0.5 + Math.random() * 0.5,
        lane: 0.12 + Math.random() * 0.76,
        fate: assignFate(),
        decided: false,
        t: 0,
        captured: 0,
      };
    }
    for (let i = 0; i < SWARM_SIZE; i++) particles.push(spawn(true));

    const GATE = 0.46; // x fraction where the decision happens
    const doorY = 0.5; // OS door vertical center

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // gate line
      ctx!.strokeStyle = "rgba(20,17,13,0.06)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(GATE * W, 8);
      ctx!.lineTo(GATE * W, H - 8);
      ctx!.stroke();

      // OS door (right side, glowing slot)
      const dh = H * 0.34;
      const dy = H * doorY - dh / 2;
      const dx = W * 0.9;
      ctx!.fillStyle = "rgba(255,102,0,0.10)";
      ctx!.fillRect(dx, dy, W * 0.1, dh);
      ctx!.strokeStyle = "#FF6600";
      ctx!.lineWidth = 2;
      ctx!.strokeRect(dx, dy, W * 0.1, dh);

      for (const p of particles) {
        const speed = reduce ? 0 : p.vx;
        p.x += speed;
        p.t = p.x / W;

        let y = p.lane * H;
        if (p.x > GATE * W) {
          // after the gate, fates diverge
          const k = Math.min(1, (p.x - GATE * W) / (W * 0.44));
          const ease = k * k * (3 - 2 * k);
          if (p.fate === "os") {
            y = p.lane * H + (doorY * H - p.lane * H) * ease;
            p.captured = ease;
          } else if (p.fate === "comp") {
            // peel off to a mid-low band
            const target = 0.82 * H;
            y = p.lane * H + (target - p.lane * H) * ease * 0.6;
          } else {
            // drift slightly, pass through
            y = p.lane * H + Math.sin((p.x + p.lane * 100) * 0.01) * 6;
          }
        }

        const c = COL[p.fate];
        const r = p.fate === "os" ? 2.6 + p.captured * 1.4 : 2.2;
        ctx!.beginPath();
        ctx!.arc(p.x, y, r, 0, Math.PI * 2);
        ctx!.fillStyle = c;
        ctx!.globalAlpha = p.fate === "self" ? 0.5 : 0.95;
        ctx!.fill();
        if (p.fate === "os" && p.captured > 0.2) {
          ctx!.globalAlpha = 0.25 * p.captured;
          ctx!.beginPath();
          ctx!.arc(p.x, y, r + 4, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;

        if (p.x > W + 12) Object.assign(p, spawn(false));
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
        agents entering →
      </div>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-yc)]">
        OrangeSlice
      </div>
    </div>
  );
}
