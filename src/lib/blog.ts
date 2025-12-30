import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  readingTime: string;
  content: string;
  featured?: boolean;
}

export function getSortedPostsData(): BlogPost[] {
  // Get file names under /content/posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      // Remove ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx$/, "");

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      // Calculate reading time (rough estimate: 200 words per minute)
      const wordCount = content.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Combine the data with the slug and content
      return {
        slug,
        content,
        readingTime: `${readingTime} min read`,
        title: data.title || "",
        date: data.date || "",
        excerpt: data.excerpt || "",
        author: data.author || "Jonathan K. Sakkos",
        tags: data.tags || [],
        featured: data.featured || false,
      } as BlogPost;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostData(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      slug,
      content,
      readingTime: `${readingTime} min read`,
      title: data.title || "",
      date: data.date || "",
      excerpt: data.excerpt || "",
      author: data.author || "Jonathan K. Sakkos",
      tags: data.tags || [],
      featured: data.featured || false,
    };
  } catch {
    return null;
  }
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.mdx$/, ""),
        },
      };
    });
}