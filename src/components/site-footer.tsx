import { getProfile } from "@/lib/content";

export function SiteFooter() {
  const { basics } = getProfile();
  const links = [
    { label: "Email", url: `mailto:${basics.email}` },
    ...basics.profiles.map((p) => ({ label: p.network, url: p.url })),
  ];
  return (
    <footer data-print-hide className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                className="hover:text-ink"
                {...(l.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p>
          © {new Date().getFullYear()} {basics.name} · {basics.imageCredit}
        </p>
      </div>
    </footer>
  );
}
