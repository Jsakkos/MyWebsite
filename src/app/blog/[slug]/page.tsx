import { notFound } from "next/navigation";
import { getPostData, getSortedPostsData } from "@/lib/blog";
import { CalendarDays, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = getPostData(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        {/* Back to blog */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {post.title}
          </h1>
          
          <div className="mt-6 flex items-center gap-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime}
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article content */}
        <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
          <MDXRemote source={post.content} />
        </div>

        {/* Article footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Written by <span className="font-semibold">{post.author}</span>
            </p>
            <div className="mt-4">
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Get in touch →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}