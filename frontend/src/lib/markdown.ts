import { marked } from "marked";
import DOMPurify from "dompurify";

export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return "";
  const rawHtml = await marked.parse(markdown);

  // Force all links to open in a new tab
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (
      "tagName" in node &&
      node.tagName === "A" &&
      node.hasAttribute("href")
    ) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  return DOMPurify.sanitize(rawHtml as string);
}

export function extractTextFromHtml(html: string): string {
  if (!html) return "";

  // 1. Use the browser's parser to extract text from HTML content
  if (typeof window !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return (doc.body.textContent || "").trim();
    } catch (e) {
      console.error("Error parsing content:", e);
      // Fallback: simple tag stripping
      return html.replace(/<[^>]*>/g, "").trim();
    }
  } else {
    // Fallback for SSR
    return html.replace(/<[^>]*>/g, "").trim();
  }
}
