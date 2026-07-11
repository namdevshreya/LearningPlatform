import React from "react";

/**
 * Circular progress ring — the app's signature motif.
 * Used anywhere a single completion percentage needs to be shown at a glance.
 */
export default function ProgressRing({
  percent = 0,
  size = 64,
  stroke = 6,
  color = "var(--primary)",
  track = "var(--surface-sunk)",
  labelSize = 13,
}) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="ring-label" style={{ fontSize: labelSize }}>
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
