import * as React from "react";
import { cn } from "../../lib/utils";

const SLICES = 16;
const CAMERA = 1.6;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

const MAX_WIDTH = 55;

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const safeW = Math.max(width || 1200, 400);
  const safeH = Math.max(height || 620, 420);
  const h = Math.min(
    (tile / 100) * safeH,
    ((MAX_WIDTH / 100) * safeW) / aspect,
  );
  const radius = safeW * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 4, sweep: 60, unit: 15, limit: 50, tileHeightPx: 160, radiusPx: 600 };
  
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(4, Math.ceil((2 * limit) / (pitch || 1))));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
    tileHeightPx: Math.max(h, 140),
    radiusPx: radius,
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 8,
  tileHeight = 30,
  aspectRatio = 16 / 9,
  gap = 8,
  axis = 50,
  curve = 70,
  fade = 14,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Initial layout with sensible defaults so it renders immediately
  const [layout, setLayout] = React.useState(() =>
    measure(1200, 620, tileHeight, aspectRatio, gap, bend)
  );
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const updateSize = () => {
      const width = el.offsetWidth || window.innerWidth;
      const height = el.offsetHeight || 620;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout(next);
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Pre-fetch images
  React.useEffect(() => {
    for (const { src } of images) {
      if (typeof window !== "undefined") {
        const img = new window.Image();
        img.src = src;
      }
    }
  }, [images]);

  const { columns, sweep, unit, limit, tileHeightPx, radiusPx } = layout;

  const tileH = tileHeightPx;
  const tileW = tileH * aspectRatio;
  const share = tileW / SLICES;
  const duration = columns * speed;

  const r = radiusPx;
  const turn = (deg: number) =>
    `translateZ(${r}px) rotateY(${+deg.toFixed(4)}deg) translateZ(-${r}px)`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `.${tile}{will-change:transform;backface-visibility:hidden;}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden w-full", className)}
      {...props}
    >
      <style>{css}</style>

      {/* 3D Tilted Curved Band with Screenshots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: 0.88,
          perspective: `${+(r * CAMERA).toFixed(1)}px`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${tileW / 2}px)`,
                top: `calc(${axis}% - ${tileH / 2}px)`,
                width: `${tileW}px`,
                height: `${tileH}px`,
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-slate-900 shadow-2xl border-y border-white/10",
                    k === 0 && "rounded-l-xl border-l border-white/20",
                    k === SLICES - 1 && "rounded-r-xl border-r border-white/20",
                  )}
                  style={{
                    left: `${((tileW - share) / 2)}px`,
                    width: k === SLICES - 1 ? `${share}px` : `${share + 1.2}px`,
                    height: `${tileH}px`,
                    transform: turn((aspectRatio / 2 - (k + 0.5) * (aspectRatio / SLICES)) * unit),
                    backfaceVisibility: "hidden",
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "") : ""}
                      draggable={false}
                      className="absolute top-0 max-w-none object-cover"
                      style={{
                        left: `${-k * share}px`,
                        width: `${tileW}px`,
                        height: `${tileH}px`,
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hero Children Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

export default TiltedGridHero;
