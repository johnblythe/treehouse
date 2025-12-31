"use client";

import { STAT_TYPES, STAT_INFO, StatType, getLevelFromXp } from "@/lib/stats";
import type { StatData } from "@/hooks/useStats";

interface StatRadarProps {
  stats: Record<StatType, StatData>;
  size?: number;
  className?: string;
}

// Pentagon math - 5 points equally spaced around circle
const POINT_COUNT = 5;
const ANGLE_OFFSET = -Math.PI / 2; // Start from top

function getPoint(index: number, radius: number, cx: number, cy: number) {
  const angle = ANGLE_OFFSET + (2 * Math.PI * index) / POINT_COUNT;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function StatRadar({ stats, size = 200, className = "" }: StatRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38; // Leave room for labels
  const labelRadius = size * 0.48;

  // Get max level for scaling (minimum 5 to avoid tiny charts early on)
  const levels = STAT_TYPES.map((st) => stats[st]?.level ?? 1);
  const maxLevel = Math.max(5, ...levels);

  // Build stat polygon points
  const statPoints = STAT_TYPES.map((statType, i) => {
    const level = stats[statType]?.level ?? 1;
    const normalizedRadius = (level / maxLevel) * maxRadius;
    return getPoint(i, Math.max(normalizedRadius, maxRadius * 0.1), cx, cy);
  });

  const polygonPath = statPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Build background rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1].map((pct) => {
    const r = maxRadius * pct;
    const ringPoints = STAT_TYPES.map((_, i) => getPoint(i, r, cx, cy));
    return ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  });

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background rings */}
        {rings.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-gray-200 dark:text-gray-700"
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {STAT_TYPES.map((_, i) => {
          const outer = getPoint(i, maxRadius, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth={1}
              className="text-gray-200 dark:text-gray-700"
            />
          );
        })}

        {/* Stats polygon - filled */}
        <path
          d={polygonPath}
          fill="rgba(147, 51, 234, 0.25)"
          stroke="rgb(147, 51, 234)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Stat points */}
        {statPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="rgb(147, 51, 234)"
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>

      {/* Labels around the chart */}
      {STAT_TYPES.map((statType, i) => {
        const pos = getPoint(i, labelRadius, cx, cy);
        const stat = stats[statType];
        const info = STAT_INFO[statType];
        const level = stat?.level ?? 1;

        // Adjust text alignment based on position
        let textAlign: "left" | "center" | "right" = "center";
        let translateX = "-50%";
        if (pos.x < cx - 10) {
          textAlign = "right";
          translateX = "-100%";
        } else if (pos.x > cx + 10) {
          textAlign = "left";
          translateX = "0%";
        }

        let translateY = "-50%";
        if (pos.y < cy - 10) translateY = "-100%";
        if (pos.y > cy + 10) translateY = "0%";

        return (
          <div
            key={statType}
            className="absolute whitespace-nowrap"
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(${translateX}, ${translateY})`,
              textAlign,
            }}
          >
            <span className="text-lg" title={info.name}>
              {info.emoji}
            </span>
            <span className="ml-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
