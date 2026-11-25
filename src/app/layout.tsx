import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NAV_ITEMS } from "@/lib/nav";
import { DEFAULT_TITLE, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/metadata";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const base = pageMetadata({ path: "/" });
export const metadata: Metadata = {
  ...base,
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s · ${SITE_NAME}` },
  authors: [{ name: "Jonathan K. Sakkos", url: SITE_URL }],
  creator: "Jonathan K. Sakkos",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader items={NAV_ITEMS} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
