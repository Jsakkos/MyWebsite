"use client";

import { useEffect, useRef, useState } from "react";
import { Train, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

function useCountUp(end: number, duration: number = 2000, decimals: number = 1) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(parseFloat((eased * end).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return { value, ref };
}

function TrendBadge({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous;
  const isUp = diff > 0.5;
  const isDown = diff < -0.5;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {isUp ? (
        <TrendingUp className="h-4 w-4 text-green-300" />
      ) : isDown ? (
        <TrendingDown className="h-4 w-4 text-red-300" />
      ) : (
        <Minus className="h-4 w-4 text-blue-300" />
      )}
      <span className={isUp ? "text-green-300" : isDown ? "text-red-300" : "text-blue-300"}>
        {isUp ? "+" : ""}{diff.toFixed(1)}%
      </span>
      <span className="text-blue-300">{label}</span>
    </div>
  );
}

interface HeroSectionProps {
  onTimePct: number;
  totalArrivals: number;
  daysTracked: number;
  dateRange: { start: string; end: string };
  rolling7d: number;
  rolling30d: number;
}

export function HeroSection({ onTimePct, totalArrivals, daysTracked, dateRange, rolling7d, rolling30d }: HeroSectionProps) {
  const pct = useCountUp(onTimePct, 2000, 1);
  const arrivals = useCountUp(totalArrivals, 2500, 0);
  const days = useCountUp(daysTracked, 1500, 0);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl sm:p-12">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Train className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Caltrain Performance</h1>
            <p className="text-blue-200 text-sm">Real-time on-time tracking & analytics</p>
          </div>
        </div>

        <div ref={pct.ref} className="mb-8">
          <div className="text-7xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
            {pct.value}
            <span className="text-4xl sm:text-5xl lg:text-6xl">%</span>
          </div>
          <p className="mt-2 text-lg text-blue-200">On-Time Performance</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <TrendBadge current={rolling7d} previous={onTimePct} label="vs overall (7d)" />
            <TrendBadge current={rolling30d} previous={onTimePct} label="vs overall (30d)" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div ref={arrivals.ref} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{arrivals.value.toLocaleString()}</div>
            <div className="mt-1 text-sm text-blue-200">Total Arrivals Tracked</div>
          </div>
          <div ref={days.ref} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold">{days.value}</div>
            <div className="mt-1 text-sm text-blue-200">Days of Data</div>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-200" />
              <div className="text-sm">
                <div className="font-semibold">{new Date(dateRange.start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div className="text-blue-300">to {new Date(dateRange.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
