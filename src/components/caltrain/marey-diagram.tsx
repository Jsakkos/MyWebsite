"use client";

import { useState, useMemo, useRef } from "react";
import type { IncidentDetail, TrainTrajectory } from "@/lib/api";

interface MareyDiagramProps {
  detail: IncidentDetail;
}

function timeToMinutes(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  return h * 60 + m + (s || 0) / 60;
}

function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export function MareyDiagram({ detail }: MareyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    train: TrainTrajectory;
  } | null>(null);

  const { stations, trajectories } = detail;

  // Compute axis ranges
  const { minTime, maxTime, minDist, maxDist, timeRange, distRange } =
    useMemo(() => {
      let tMin = Infinity;
      let tMax = -Infinity;

      for (const t of trajectories) {
        for (const p of t.points) {
          const m = timeToMinutes(p.time);
          if (m < tMin) tMin = m;
          if (m > tMax) tMax = m;
        }
      }

      // Add 30 min padding
      tMin = Math.floor((tMin - 30) / 30) * 30;
      tMax = Math.ceil((tMax + 30) / 30) * 30;

      const dMin = Math.min(...stations.map((s) => s.distance));
      const dMax = Math.max(...stations.map((s) => s.distance));

      return {
        minTime: tMin,
        maxTime: tMax,
        minDist: dMin,
        maxDist: dMax,
        timeRange: tMax - tMin,
        distRange: dMax - dMin || 1,
      };
    }, [trajectories, stations]);

  // Layout
  const margin = { top: 20, right: 20, bottom: 50, left: 100 };
  const width = 1000;
  const height = 480;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const xScale = (minutes: number) =>
    margin.left + ((minutes - minTime) / timeRange) * plotW;
  const yScale = (dist: number) =>
    margin.top + ((dist - minDist) / distRange) * plotH;

  // Time grid ticks — adapt interval to avoid overlapping labels
  const timeTicks = useMemo(() => {
    const span = maxTime - minTime;
    // Pick interval: 60 min for wide ranges, 30 min for narrow
    const interval = span > 480 ? 60 : 30;
    const ticks = [];
    const start = Math.ceil(minTime / interval) * interval;
    for (let t = start; t <= maxTime; t += interval) {
      ticks.push(t);
    }
    return ticks;
  }, [minTime, maxTime]);

  // Build polyline strings
  const trainLines = useMemo(() => {
    // Sort: normal first, then cascading, then anomalous (so anomalous renders on top)
    const sorted = [...trajectories].sort((a, b) => {
      const order = (t: TrainTrajectory) =>
        t.is_anomalous && !t.is_cascading ? 2 : t.is_cascading ? 1 : 0;
      return order(a) - order(b);
    });

    return sorted.map((t) => {
      const points = t.points
        .map((p) => `${xScale(timeToMinutes(p.time))},${yScale(p.distance)}`)
        .join(" ");
      return { ...t, polyline: points };
    });
  }, [trajectories, xScale, yScale]);

  // Find root cause annotation
  const annotation = useMemo(() => {
    const rootTrain = trainLines.find(
      (t) => t.is_anomalous && !t.is_cascading
    );
    if (!rootTrain || rootTrain.points.length < 5) return null;

    // Find flat section: 5+ consecutive points with < 0.3km range
    const pts = rootTrain.points;
    for (let i = 0; i < pts.length - 4; i++) {
      const window = pts.slice(i, i + 5);
      const dists = window.map((p) => p.distance);
      if (Math.max(...dists) - Math.min(...dists) < 0.3) {
        const centerTime = timeToMinutes(window[2].time);
        const centerDist =
          dists.reduce((a, b) => a + b) / dists.length;

        // Calculate hold duration
        let endIdx = i + 5;
        while (
          endIdx < pts.length &&
          Math.abs(pts[endIdx].distance - centerDist) < 0.3
        ) {
          endIdx++;
        }
        const holdMinutes = Math.round(
          timeToMinutes(pts[endIdx - 1].time) - timeToMinutes(pts[i].time)
        );

        // Find nearest station
        const nearestStation = stations.reduce((best, s) =>
          Math.abs(s.distance - centerDist) < Math.abs(best.distance - centerDist)
            ? s
            : best
        );

        return {
          x: xScale(centerTime),
          y: yScale(centerDist),
          holdMin: holdMinutes,
          station: nearestStation.name,
          trainId: rootTrain.trip_id,
        };
      }
    }
    return null;
  }, [trainLines, stations, xScale, yScale]);

  function handleMouseMove(
    e: React.MouseEvent<SVGElement>,
    train: TrainTrajectory
  ) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setTooltip({ x: svgPt.x, y: svgPt.y, train });
  }

  return (
    <div className="overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[600px] w-full"
        style={{ fontFamily: "system-ui, sans-serif" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Station grid lines */}
        {stations.map((s) => (
          <g key={s.name}>
            <line
              x1={margin.left}
              y1={yScale(s.distance)}
              x2={width - margin.right}
              y2={yScale(s.distance)}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={0.5}
            />
            <text
              x={margin.left - 8}
              y={yScale(s.distance) + 3}
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              {s.name
                .replace(" Caltrain Station", "")
                .replace("San Francisco", "SF")
                .replace("San Jose Diridon", "San Jose")
                .replace("Mountain View", "Mtn View")
                .replace("South San Francisco", "S. SF")
                .replace("Redwood City", "Redwood Cty")
                .replace("California Avenue", "Cal Ave")}
            </text>
          </g>
        ))}

        {/* Time grid lines */}
        {timeTicks.map((t) => (
          <g key={t}>
            <line
              x1={xScale(t)}
              y1={margin.top}
              x2={xScale(t)}
              y2={height - margin.bottom}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
            <text
              x={xScale(t)}
              y={height - margin.bottom + 16}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              {minutesToLabel(t)}
            </text>
          </g>
        ))}

        {/* Train trajectories */}
        {trainLines.map((t, i) => {
          const isRoot = t.is_anomalous && !t.is_cascading;
          const color = isRoot
            ? "#ef4444"
            : t.is_cascading
            ? "#f97316"
            : t.direction === "SB"
            ? "#3b82f6"
            : "#60a5fa";
          const strokeWidth = isRoot ? 2.5 : t.is_cascading ? 1.8 : 1;
          const opacity = isRoot ? 0.9 : t.is_cascading ? 0.6 : 0.25;

          return (
            <g key={`${t.trip_id}-${i}`}>
              <polyline
                points={t.polyline}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, t)}
                onMouseLeave={() => setTooltip(null)}
              />
              {/* GPS dots for anomalous trains */}
              {(isRoot || t.is_cascading) &&
                t.points.map((p, j) => (
                  <circle
                    key={j}
                    cx={xScale(timeToMinutes(p.time))}
                    cy={yScale(p.distance)}
                    r={isRoot ? 2.5 : 1.5}
                    fill={color}
                    opacity={isRoot ? 0.8 : 0.5}
                  />
                ))}
            </g>
          );
        })}

        {/* Annotation callout for root cause */}
        {annotation && (
          <g>
            <rect
              x={annotation.x + 10}
              y={annotation.y - 30}
              width={160}
              height={38}
              rx={6}
              className="fill-white dark:fill-gray-800"
              stroke="#ef4444"
              strokeWidth={1}
              opacity={0.95}
            />
            <text
              x={annotation.x + 18}
              y={annotation.y - 14}
              fill="#ef4444"
              fontSize={10}
              fontWeight="bold"
            >
              Train {annotation.trainId} — {annotation.holdMin}min hold
            </text>
            <text
              x={annotation.x + 18}
              y={annotation.y + 1}
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              {annotation.station}
            </text>
          </g>
        )}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x + 10, width - 170)}
              y={Math.max(tooltip.y - 45, margin.top)}
              width={155}
              height={40}
              rx={6}
              className="fill-white dark:fill-gray-800"
              stroke="#e5e7eb"
              strokeWidth={1}
              opacity={0.95}
            />
            <text
              x={Math.min(tooltip.x + 18, width - 162)}
              y={Math.max(tooltip.y - 28, margin.top + 17)}
              className="fill-gray-900 dark:fill-white"
              fontSize={10}
              fontWeight="bold"
            >
              Train {tooltip.train.trip_id} ({tooltip.train.direction})
            </text>
            <text
              x={Math.min(tooltip.x + 18, width - 162)}
              y={Math.max(tooltip.y - 14, margin.top + 31)}
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              {tooltip.train.is_anomalous
                ? `Delayed ${tooltip.train.max_delay_min} min`
                : "On schedule"}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${margin.left}, ${height - 12})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={24} y={3} className="fill-gray-500 dark:fill-gray-400" fontSize={9}>Normal</text>

          <line x1={80} y1={0} x2={100} y2={0} stroke="#ef4444" strokeWidth={2.5} />
          <circle cx={90} cy={0} r={2} fill="#ef4444" />
          <text x={104} y={3} className="fill-gray-500 dark:fill-gray-400" fontSize={9}>Primary delay</text>

          <line x1={200} y1={0} x2={220} y2={0} stroke="#f97316" strokeWidth={1.8} />
          <text x={224} y={3} className="fill-gray-500 dark:fill-gray-400" fontSize={9}>Cascading</text>

          <text x={320} y={3} className="fill-gray-400 dark:fill-gray-500" fontSize={8}>Flat sections = stopped train</text>
        </g>
      </svg>
    </div>
  );
}
