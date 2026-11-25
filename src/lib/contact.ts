export const FORMSPREE_URL = "https://formspree.io/f/mpqzbejw";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type ContactResult = { ok: true } | { ok: false; error: string };

const FALLBACK = "Something went wrong sending your message. Please try again, or email me directly.";

export async function submitContact(
  data: ContactMessage,
  fetchImpl: (url: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<ContactResult> {
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    return { ok: false, error: "Please fill in your name, email and a message." };
  }
  try {
    const res = await fetchImpl(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? { ok: true } : { ok: false, error: FALLBACK };
  } catch {
    return { ok: false, error: FALLBACK };
  }
}
