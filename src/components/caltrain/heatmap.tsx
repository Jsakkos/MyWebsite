"use client";

import { useState } from "react";
import type { HeatmapCell } from "@/lib/api";
import { performanceColor } from "@/components/caltrain/palette";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);


interface HeatmapProps {
  data: HeatmapCell[];
  /** Cleaned exports group by scheduled hour; legacy ones by the hour the train arrived. */
  cleaned?: boolean;
}

export function Heatmap({ data, cleaned = false }: HeatmapProps) {
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
      <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">
        When Are Trains On Time?
      </h2>
      <div className="rounded-md border border-rule bg-paper p-4">
        <p className="mb-4 text-sm text-muted">
          On-time percentage by day of week and {cleaned ? "scheduled hour" : "hour"}. Greener = more reliable.
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
                className="fill-muted"
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
                  className="fill-muted"
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
                      fill={count > 0 ? performanceColor(pct) : "var(--paper-2)"}
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
              { label: "95%+", pct: 95 },
              { label: "90%", pct: 90 },
              { label: "85%", pct: 85 },
              { label: "80%", pct: 80 },
              { label: "75%", pct: 75 },
              { label: "70%", pct: 70 },
              { label: "60%", pct: 60 },
              { label: "<60%", pct: 0 },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${labelW + i * 70}, ${svgH - 30})`}>
                <rect width={14} height={14} rx={3} fill={performanceColor(item.pct)} />
                <text x={18} y={11} fontSize={10} className="fill-muted">
                  {item.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-md bg-ink px-3 py-2 text-xs text-paper"
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
