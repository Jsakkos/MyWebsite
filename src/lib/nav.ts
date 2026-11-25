export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Work", href: "/work/" },
  { label: "Projects", href: "/projects/" },
  { label: "Papers", href: "/publications/" },
  { label: "Notes", href: "/notes/" },
  { label: "Contact", href: "/contact/" },
];

const withSlash = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export function isActivePath(pathname: string, href: string): boolean {
  const current = withSlash(pathname);
  const target = withSlash(href);
  if (target === "/") return current === "/";
  return current.startsWith(target);
}
