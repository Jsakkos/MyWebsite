"use client";

import { useState } from "react";
import { submitContact } from "@/lib/contact";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

const field =
  "mt-1.5 block w-full rounded-md border border-field bg-paper px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ state: "sending" });
    const result = await submitContact({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    });
    if (result.ok) {
      form.reset();
      setStatus({ state: "sent" });
    } else {
      setStatus({ state: "error", message: result.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-ink-2">
          Name
          <input name="name" type="text" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm text-ink-2">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block text-sm text-ink-2">
        Message
        <textarea name="message" required rows={6} className={field} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending…" : "Send message"}
        </button>
        <p aria-live="polite" className="text-sm">
          {status.state === "sent" && <span className="text-ontime">Thanks, your message is on its way.</span>}
          {status.state === "error" && <span className="text-major">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
