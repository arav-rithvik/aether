"use client";

// OrangeSlice brand mark — a citrus half-slice.
// Recreation in brand orange; swap for the official asset when available.
export function OrangeSliceMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[7px] ${className}`}
      style={{ width: size, height: size, background: "var(--color-yc)" }}
      aria-label="OrangeSlice"
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" fill="none">
        {/* white half-slice */}
        <path d="M3.5 16 A8.5 8.5 0 0 1 20.5 16 Z" fill="#fff" />
        {/* rind */}
        <path d="M3.5 16 A8.5 8.5 0 0 1 20.5 16" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        {/* wedge separators in orange */}
        <g stroke="var(--color-yc)" strokeWidth="1.1" strokeLinecap="round">
          <line x1="12" y1="16" x2="12" y2="7.6" />
          <line x1="12" y1="16" x2="6.1" y2="10.1" />
          <line x1="12" y1="16" x2="17.9" y2="10.1" />
          <line x1="12" y1="16" x2="8.6" y2="8.2" />
          <line x1="12" y1="16" x2="15.4" y2="8.2" />
        </g>
      </svg>
    </span>
  );
}
