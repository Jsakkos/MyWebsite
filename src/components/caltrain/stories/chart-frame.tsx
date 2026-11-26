import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One SVG layout: its coordinate size and its marks. */
export interface ChartLayout {
  width: number;
  height: number;
  children: ReactNode;
}

export interface ChartFrameProps {
  /** A short name for the chart, shown above it. */
  title: string;
  /** The caption under the chart: what it shows and how to read it. */
  caption: ReactNode;
  /** One sentence from the data; the SVG's text alternative. */
  summary: string;
  /** The SVG's marks, drawn in a `width` × `height` coordinate box. */
  width: number;
  height: number;
  children: ReactNode;
  /**
   * An optional second layout for phones. When given, it shows below `sm:` and the
   * main layout shows from `sm:` up, so labels stay legible at 375 px.
   */
  narrow?: ChartLayout;
  /** An HTML key above the chart (wraps on narrow screens). */
  legend?: ReactNode;
  /** Caps the SVG's width, for small charts that would otherwise blow up. */
  maxWidthClass?: string;
}

function Svg({
  layout,
  summary,
  className,
}: {
  layout: ChartLayout;
  summary: string;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width="100%"
      preserveAspectRatio="xMinYMin meet"
      className={cn("block h-auto overflow-visible", className)}
    >
      {layout.children}
    </svg>
  );
}

/**
 * A chart in the Field notes style: no box, a small title, the SVG, a caption.
 * It breaks out of the prose column from `sm:` up.
 */
export function ChartFrame({
  title,
  caption,
  summary,
  width,
  height,
  children,
  narrow,
  legend,
  maxWidthClass,
}: ChartFrameProps) {
  const wide: ChartLayout = { width, height, children };
  return (
    <figure className="not-prose my-10 sm:-mx-4 lg:-mx-16">
      <div className="mb-3 font-sans text-sm font-medium text-ink">{title}</div>
      {legend ? <div className="mb-3 font-sans text-xs text-muted">{legend}</div> : null}
      {narrow ? (
        <>
          <Svg layout={narrow} summary={summary} className={cn("max-w-md sm:hidden", maxWidthClass)} />
          <Svg layout={wide} summary={summary} className={cn("hidden sm:block", maxWidthClass)} />
        </>
      ) : (
        <Svg layout={wide} summary={summary} className={maxWidthClass} />
      )}
      <figcaption className="mt-3 max-w-2xl font-sans text-xs leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

/** A small color key entry for a ChartFrame legend. */
export function LegendSwatch({
  color,
  label,
  shape = "square",
  opacity = 1,
}: {
  color: string;
  label: string;
  shape?: "square" | "line";
  opacity?: number;
}) {
  return (
    <span className="mr-4 inline-flex items-center gap-1.5 whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
        {shape === "line" ? (
          <line x1="0" y1="6" x2="12" y2="6" stroke={color} strokeWidth="2.5" />
        ) : (
          <rect x="1" y="1" width="10" height="10" fill={color} fillOpacity={opacity} />
        )}
      </svg>
      {label}
    </span>
  );
}
