import { submitContact } from "@/lib/contact";

const valid = { name: "Ada", email: "ada@example.com", message: "Hello there" };

test("ok response → ok", async () => {
  let sent: RequestInit | undefined;
  const result = await submitContact(valid, async (_url, init) => {
    sent = init;
    return new Response("{}", { status: 200 });
  });
  expect(result).toEqual({ ok: true });
  expect(JSON.parse(String(sent?.body))).toEqual(valid);
});

test("non-ok and thrown fetch → friendly error", async () => {
  const bad = await submitContact(valid, async () => new Response("", { status: 500 }));
  expect(bad.ok).toBe(false);
  const offline = await submitContact(valid, async () => {
    throw new Error("offline");
  });
  expect(offline).toEqual({ ok: false, error: expect.stringMatching(/email/i) });
});

test("missing fields are rejected before any request", async () => {
  let called = false;
  const result = await submitContact({ ...valid, message: "  " }, async () => {
    called = true;
    return new Response("{}");
  });
  expect(result.ok).toBe(false);
  expect(called).toBe(false);
});
