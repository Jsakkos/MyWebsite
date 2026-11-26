import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { STORIES_PATH, storiesAvailable } from "@/lib/caltrain-stories";

export const metadata: Metadata = pageMetadata({
  title: "Caltrain dashboard",
  description: "On-time performance, delay patterns and incident diagrams for every Caltrain, logged once a minute.",
  path: "/projects/caltrain-tracker/dashboard/",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {storiesAvailable() && (
        <div className="mx-auto max-w-5xl px-6 pt-6">
          <Link href={STORIES_PATH} className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong">
            Read the stories
          </Link>
          <span className="text-sm text-muted"> &mdash; what this data shows about when Caltrain runs late.</span>
        </div>
      )}
      {children}
    </>
  );
}
