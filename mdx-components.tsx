import type { MDXComponents } from "mdx/types";

// Required by @next/mdx. Notes render through next-mdx-remote inside a
// `prose prose-field` wrapper, so no element overrides are needed here.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
