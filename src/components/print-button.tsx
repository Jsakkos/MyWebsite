"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-accent underline decoration-rule underline-offset-4 hover:decoration-accent"
    >
      Print or save as PDF
    </button>
  );
}
