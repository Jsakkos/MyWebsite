import Link from "next/link";
import { cn } from "@/lib/utils";

/** Italic serif label in the accent green, used for "Now", "Before", section kickers. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-serif text-base italic text-accent", className)}>{children}</p>;
}

export function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-serif text-2xl tracking-tight text-ink sm:text-3xl">
      {children}
    </h2>
  );
}

/** Link that opens external URLs in a new tab and keeps site paths client-side. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "text-accent underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-accent",
    className,
  );
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

export function PageIntro({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pb-10 pt-16 sm:pt-20">
      {label && <Label>{label}</Label>}
      <h1 className="mt-1 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{children}</div>}
    </header>
  );
}
