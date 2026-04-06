"use client";

import { useState } from "react";
import type { HeatmapCell } from "@/lib/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getColor(pct: number): string {
  if (pct >= 95) return "#059669";   // emerald-600
  if (pct >= 90) return "#10b981";   // emerald-500
  if (pct >= 85) return "#34d399";   // emerald-400
  if (pct >= 80) return "#6ee7b7";   // emerald-300
  if (pct >= 75) return "#fbbf24";   // amber-400
  if (pct >= 70) return "#f59e0b";   // amber-500
  if (pct >= 60) return "#f97316";   // orange-500
  return "#ef4444";                   // red-500
}

interface HeatmapProps {
  data: HeatmapCell[];
}

export function Heatmap({ data }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ cell: HeatmapCell; x: number; y: number } | null>(null);

  // Build lookup: data[dayOfWeek][hour] = cell
  const lookup = new Map<string, HeatmapCell>();
  data.forEach((cell) => {
    lookup.set(`${cell.day_of_week}-${cell.hour}`, cell);
  });

  const cellSize = 28;
  const gap = 3;
  const labelW = 40;
  const labelH = 30;
  const svgW = labelW + HOURS.length * (cellSize + gap);
  const svgH = labelH + DAYS.length * (cellSize + gap) + 40;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        When Are Trains On Time?
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          On-time percentage by day of week and hour. Greener = more reliable.
        </p>
        <div className="overflow-x-auto">
          <svg
            width={svgW}
            height={svgH}
            className="mx-auto"
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Hour labels */}
            {HOURS.map((h) => (
              <text
                key={`h-${h}`}
                x={labelW + h * (cellSize + gap) + cellSize / 2}
                y={labelH - 8}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={10}
              >
                {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
              </text>
            ))}

            {/* Day labels + cells */}
            {DAYS.map((day, di) => (
              <g key={day}>
                <text
                  x={labelW - 8}
                  y={labelH + di * (cellSize + gap) + cellSize / 2 + 4}
                  textAnchor="end"
                  className="fill-gray-600 dark:fill-gray-300"
                  fontSize={12}
                  fontWeight={500}
                >
                  {day}
                </text>
                {HOURS.map((h) => {
                  const cell = lookup.get(`${di}-${h}`);
                  const pct = cell?.on_time_pct ?? 0;
                  const count = cell?.total ?? 0;
                  return (
                    <rect
                      key={`${di}-${h}`}
                      x={labelW + h * (cellSize + gap)}
                      y={labelH + di * (cellSize + gap)}
                      width={cellSize}
                      height={cellSize}
                      rx={4}
                      fill={count > 0 ? getColor(pct) : "#f3f4f6"}
                      opacity={count > 0 ? 1 : 0.3}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onMouseEnter={(e) => {
                        if (cell) {
                          const rect = (e.target as SVGRectElement).getBoundingClientRect();
                          setTooltip({ cell, x: rect.x + rect.width / 2, y: rect.y });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </g>
            ))}

            {/* Color scale legend */}
            {[
              { label: "95%+", color: "#059669" },
              { label: "90%", color: "#10b981" },
              { label: "85%", color: "#34d399" },
              { label: "80%", color: "#6ee7b7" },
              { label: "75%", color: "#fbbf24" },
              { label: "70%", color: "#f59e0b" },
              { label: "<60%", color: "#ef4444" },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${labelW + i * 70}, ${svgH - 30})`}>
                <rect width={14} height={14} rx={3} fill={item.color} />
                <text x={18} y={11} fontSize={10} className="fill-gray-500 dark:fill-gray-400">
                  {item.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y - 60,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-semibold">{tooltip.cell.day_name} {tooltip.cell.hour}:00</div>
            <div>On-time: {tooltip.cell.on_time_pct}%</div>
            <div>Avg delay: {tooltip.cell.avg_delay_min} min</div>
            <div>{tooltip.cell.total} trains</div>
          </div>
        )}
      </div>
    </section>
  );
}
