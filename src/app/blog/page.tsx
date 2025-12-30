import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import { CalendarDays, Clock, Tag } from "lucide-react";

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Technical Blog
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Insights on biotech engineering, process development, automation, and technical innovation.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-full text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Blog posts coming soon! Check back later for insights on biotech engineering and technical innovation.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="flex flex-col items-start">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.date} className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}
                  </span>
                </div>
                
                <div className="group relative mt-3">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {post.excerpt}
                  </p>
                </div>

                {post.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <Tag className="h-2 w-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative mt-8 flex items-center gap-x-4">
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      <span className="absolute inset-0" />
                      {post.author}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Senior Process Development Engineer</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}