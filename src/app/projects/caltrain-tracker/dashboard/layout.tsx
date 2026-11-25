import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Caltrain dashboard",
  description: "On-time performance, delay patterns and incident diagrams for every Caltrain, logged once a minute.",
  path: "/projects/caltrain-tracker/dashboard/",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
