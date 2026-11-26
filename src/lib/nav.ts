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

/** Notes only appears once at least one note is published, so the section never shows empty. */
export function navItemsFor(hasNotes: boolean): NavItem[] {
  return hasNotes ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.href !== "/notes/");
}

const withSlash =(p: string) => (p.endsWith("/") ? p : `${p}/`);

export function isActivePath(pathname: string, href: string): boolean {
  const current = withSlash(pathname);
  const target = withSlash(href);
  if (target === "/") return current === "/";
  return current.startsWith(target);
}
