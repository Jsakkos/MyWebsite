import Link from "next/link";
import { Github, Linkedin, Mail, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link
            href="https://github.com/jsakkos"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/jonathan-sakkos-b2833a4/"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-6 w-6" />
          </Link>
          <Link
            href="https://scholar.google.com/citations?user=lk-vZ4EAAAAJ&hl=en"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Google Scholar</span>
            <BookOpen className="h-6 w-6" />
          </Link>
          <Link
            href="mailto:jonathansakkos@gmail.com"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <span className="sr-only">Email</span>
            <Mail className="h-6 w-6" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Jonathan K. Sakkos. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}