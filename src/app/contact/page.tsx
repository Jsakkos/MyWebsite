import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/contact-form";
import { Label, PageIntro, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch about roles, collaborations, or anything you saw here.",
  path: "/contact/",
});

export default function ContactPage() {
  const { basics } = getProfile();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageIntro label="Contact" title="Say hello">
        <p>
          Whether it&apos;s a role, a collaboration, or a question about something on this site, I&apos;d like to hear
          from you. Email is quickest.
        </p>
      </PageIntro>

      <div className="grid gap-12 border-t border-rule pt-10 md:grid-cols-[16rem_1fr]">
        <div>
          <Label>Directly</Label>
          <p className="mt-2">
            <TextLink href={`mailto:${basics.email}`}>{basics.email}</TextLink>
          </p>
          <Label className="mt-8">Elsewhere</Label>
          <ul className="mt-2 space-y-1.5">
            {basics.profiles.map((p) => (
              <li key={p.network}>
                <TextLink href={p.url}>{p.network}</TextLink>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">Based in {basics.location}.</p>
        </div>
        <div>
          <Label>Or send a note</Label>
          <div className="mt-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
