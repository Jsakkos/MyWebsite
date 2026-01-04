"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Publications", href: "/publications" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold text-primary">Jonathan K. Sakkos</span>
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-semibold leading-6 transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-gray-900 dark:text-gray-100"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Toggle theme</span>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu - Rendered outside header to avoid height constraints */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-gray-600/75 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-lg font-bold text-primary">Jonathan K. Sakkos</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="mt-4 flow-root">
              <div className="-my-2 divide-y divide-gray-500/10">
                <div className="space-y-1 py-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 transition-colors",
                        pathname === item.href
                          ? "text-primary bg-gray-50 dark:bg-gray-800"
                          : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-3">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    Toggle theme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}