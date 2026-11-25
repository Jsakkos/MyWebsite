const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-08" or "2025-08-10" → "Aug 2025". String math only, so no timezone drift. */
export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDateRange(start: string, end?: string): string {
  return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : "present"}`;
}

export function doiUrl(doi: string): string {
  const bare = doi.replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:)/i, "");
  return `https://doi.org/${bare}`;
}

export function splitAuthors(authors: string[]): { name: string; self: boolean }[] {
  return authors.map((name) => ({ name, self: /\bSakkos\b/.test(name) }));
}
