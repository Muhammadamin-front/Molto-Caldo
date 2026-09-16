"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;

const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
): string {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export default function KineticGrid({
  children,
  className,
  globalColor = "default",
}: {
  children?: ReactNode;
  className?: string;
  globalColor?: "default" | "monochrome";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const getWarpedPoint = useCallback(
    (
      gx: number,
      gy: number,
      col: number,
      row: number,
      mouse: Point,
      ripples: Ripple[],
      cols: number,
      rows: number,
    ): { pt: Point; proximity: number } => {
      const edgeMargin = 1.5;
      const colPin = Math.min(
        col / edgeMargin,
        (cols - 1 - col) / edgeMargin,
        1,
      );
      const rowPin = Math.min(
        row / edgeMargin,
        (rows - 1 - row) / edgeMargin,
        1,
      );
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

      let rx = 0;
      let ry = 0;
      for (const ripple of ripples) {
        const rdx = gx - ripple.x;
        const rdy = gy - ripple.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - ripple.radius;
        if (Math.abs(diff) < waveWidth) {
          const strength =
            (1 - Math.abs(diff) / waveWidth) *
            ripple.opacity *
            18 *
            pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased =
          t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warpAmount = eased * MAX_WARP * pinFactor;
        const angle = Math.atan2(dy, dx);
        return {
          pt: {
            x: gx - Math.cos(angle) * warpAmount + rx,
            y: gy - Math.sin(angle) * warpAmount + ry,
          },
          proximity,
        };
      }

      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    [],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w: width, h: height } = sizeRef.current;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;
      const theme = {
        default: {
          bg: "#161618",
          lineActive: { r: 74, g: 158, b: 255, a: 0.9 },
          nodeActive: { r: 74, g: 158, b: 255, a: 1 },
          glow: "74,158,255",
          ripple: "100,180,255",
        },
        monochrome: {
          bg: "#000000",
          lineActive: { r: 255, g: 255, b: 255, a: 0.9 },
          nodeActive: { r: 255, g: 255, b: 255, a: 1 },
          glow: "255,255,255",
          ripple: "255,255,255",
        },
      }[globalColor];

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const ripple = ripples[i];
        const age = (now - ripple.born) / 1000;
        ripple.radius = Math.max(0, age * 400);
        ripple.opacity = Math.max(0, 1 - age * 1.2);
        if (ripple.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(width / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(height / CELL_SIZE)) + 1;
      const cellWidth = width / (cols - 1);
      const cellHeight = height / (rows - 1);
      const points: Point[][] = [];
      const proximity: number[][] = [];

      for (let row = 0; row < rows; row += 1) {
        points[row] = [];
        proximity[row] = [];
        for (let col = 0; col < cols; col += 1) {
          const warped = getWarpedPoint(
            col * cellWidth,
            row * cellHeight,
            col,
            row,
            mouse,
            ripples,
            cols,
            rows,
          );
          points[row][col] = warped.pt;
          proximity[row][col] = warped.proximity;
        }
      }

      const drawSegment = (
        p1: Point,
        p2: Point,
        proximity1: number,
        proximity2: number,
      ) => {
        const average = (proximity1 + proximity2) / 2;
        const t = average * average * (3 - 2 * average);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, theme.lineActive, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      };

      ctx.lineCap = "butt";
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols - 1; col += 1) {
          drawSegment(
            points[row][col],
            points[row][col + 1],
            proximity[row][col],
            proximity[row][col + 1],
          );
        }
      }
      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows - 1; row += 1) {
          drawSegment(
            points[row][col],
            points[row + 1][col],
            proximity[row][col],
            proximity[row + 1][col],
          );
        }
      }

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const point = points[row][col];
          const near = proximity[row][col];
          const t = near * near * (3 - 2 * near);
          const radius = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          if (t > 0.3) {
            const glowRadius = radius + lerpN(0, 6, (t - 0.3) / 0.7);
            const gradient = ctx.createRadialGradient(
              point.x,
              point.y,
              radius * 0.5,
              point.x,
              point.y,
              glowRadius,
            );
            gradient.addColorStop(
              0,
              `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`,
            );
            gradient.addColorStop(1, `rgba(${theme.glow},0)`);
            ctx.beginPath();
            ctx.arc(point.x, point.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(
            { r: 255, g: 255, b: 255, a: 0.2 },
            theme.nodeActive,
            t,
          );
          ctx.fill();
        }
      }

      for (const ripple of ripples) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${theme.ripple},${(
          ripple.opacity * 0.28
        ).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [getWarpedPoint, globalColor],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = (now: number) => {
      const mouse = mouseRef.current;
      const target = targetMouseRef.current;
      mouse.x = lerpN(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerpN(mouse.y, target.y, LERP_SPEED);
      draw(now);
      rafRef.current = requestAnimationFrame(animate);
    };

    const setSize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.getContext("2d")?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      sizeRef.current = { w: width, h: height };
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const isInside =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      targetMouseRef.current = isInside
        ? { x, y }
        : { x: -9999, y: -9999 };
    };
    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", setSize);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      draw(performance.now());
    } else {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("click", onClick);
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        globalColor === "monochrome" ? "bg-black" : "bg-[#161618]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
