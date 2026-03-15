import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { unified } from "unified";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function rehypeHeadingClasses() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        node.properties.className = [...(node.properties.className || []), "group", "flex", "items-center", "w-fit"];
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    // parse math blocks and inline math
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHeadingClasses)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["subheading-anchor"],
        ariaLabel: "Link to section",
      },
      content: {
        type: "element",
        tagName: "span",
        properties: {
          className: ["opacity-0", "transition-opacity", "duration-300", "group-hover:opacity-100", "text-muted-foreground", "inline-block", "w-4", "h-4", "ml-2"],
          style: "vertical-align: middle;",
        },
        children: [
          {
            type: "element",
            tagName: "svg",
            properties: {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: ["lucide", "lucide-link"],
            },
            children: [
              {
                type: "element",
                tagName: "path",
                properties: { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" },
                children: [],
              },
              {
                type: "element",
                tagName: "path",
                properties: { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
                children: [],
              },
            ],
          },
        ],
      },
    })
    // render math to HTML using KaTeX
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

export async function getPost(slug: string) {
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  let source = fs.readFileSync(filePath, "utf-8");
  const { content: rawContent, data: metadata } = matter(source);
  if (metadata.draft) {
    return null;
  }
  const content = await markdownToHTML(rawContent);
  return {
    source: content,
    metadata,
    slug,
  };
}

async function getAllPosts(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return Promise.all(
    mdxFiles.map(async (file) => {
      let slug = path.basename(file, path.extname(file));
      let post = await getPost(slug);
      if (post) {
        return {
          metadata: post.metadata,
          slug,
          source: post.source,
        };
      }
      return null;
    }),
  ).then(posts => posts.filter(p => p !== null));
}

export async function getBlogPosts() {
  return getAllPosts(path.join(process.cwd(), "content"));
}
