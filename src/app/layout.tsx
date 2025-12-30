import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jonathan K. Sakkos - Senior Process Development Engineer",
  description: "Senior Process Development Engineer at Curio Bioscience specializing in biotechnology, process automation, and biomaterials. Expert in scaling manufacturing processes for spatial biology platforms.",
  keywords: ["biotech", "process development", "automation", "biotechnology", "engineering", "spatial biology", "curio bioscience", "synthetic biology", "biomaterials"],
  authors: [{ name: "Jonathan K. Sakkos" }],
  creator: "Jonathan K. Sakkos",
  publisher: "Jonathan K. Sakkos",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.jonathanksakkos.com",
  },
  openGraph: {
    title: "Jonathan K. Sakkos - Senior Process Development Engineer",
    description: "Senior Process Development Engineer at Curio Bioscience specializing in biotechnology, process automation, and biomaterials.",
    url: "https://www.jonathanksakkos.com",
    siteName: "Jonathan K. Sakkos",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jonathan K. Sakkos - Senior Process Development Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonathan K. Sakkos - Senior Process Development Engineer",
    description: "Senior Process Development Engineer at Curio Bioscience",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
