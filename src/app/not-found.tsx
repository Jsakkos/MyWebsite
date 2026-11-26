import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-serif text-lg italic text-accent">404</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">This page isn&apos;t in the notebook.</h1>
      <p className="mt-4 text-lg text-ink-2">
        It may have moved when the site was rebuilt. These are good places to start:
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-accent">
        <li>
          <Link href="/" className="underline decoration-rule hover:decoration-accent">Home</Link>
        </li>
        <li>
          <Link href="/work/" className="underline decoration-rule hover:decoration-accent">Work</Link>
        </li>
        <li>
          <Link href="/projects/" className="underline decoration-rule hover:decoration-accent">Projects</Link>
        </li>
      </ul>
    </div>
  );
}
