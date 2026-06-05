/**
 * Markdown → WeChat-compatible HTML converter
 *
 * Handles paste from formatting tools like knb.im that export Markdown.
 * Uses marked as base, with custom extensions for:
 * - ==highlight== → <mark>
 * - ++underline++ → <u>
 * - :::intro ... ::: → styled blockquote
 */
import { marked } from "marked";

/** Check if text looks like Markdown (has syntax markers) */
export function looksLikeMarkdown(text: string): boolean {
  return /(\*\*|__|==|\+\+|\[TOC\]|^#{1,3}\s|```|^>\s|:::intro)/m.test(text);
}

/** Pre-process knb.im-specific syntax into standard HTML */
function preProcessKnb(input: string): string {
  let result = input;

  // [TOC] → skip
  result = result.replace(/^\[TOC\]\s*$/gm, "");

  // ==highlight== → <mark>
  result = result.replace(/==(.+?)==/g, '<mark style="background:#fff5cc;padding:0 2px">$1</mark>');

  // ++underline++ → <u>
  result = result.replace(/\+\+(.+?)\+\+/g, "<u>$1</u>");

  // :::intro ... ::: → styled blockquote
  result = result.replace(
    /:::intro\s*\n([\s\S]*?)\n:::/g,
    (_: string, content: string) =>
      `<blockquote style="background:#f8f8f8;padding:15px 20px;border-left:4px solid #ccc;margin:1em 0">${content.trim()}</blockquote>`
  );

  // :::tip ... ::: → tip block
  result = result.replace(
    /:::tip\s*\n([\s\S]*?)\n:::/g,
    (_: string, content: string) =>
      `<section style="background:#f0f7ff;padding:15px 20px;border-left:4px solid #4a90d9;margin:1em 0;border-radius:4px">${content.trim()}</section>`
  );

  // :::warning ... ::: → warning block
  result = result.replace(
    /:::warning\s*\n([\s\S]*?)\n:::/g,
    (_: string, content: string) =>
      `<section style="background:#fff8f0;padding:15px 20px;border-left:4px solid #e8a838;margin:1em 0;border-radius:4px">${content.trim()}</section>`
  );

  // :::note ... ::: → note block
  result = result.replace(
    /:::note\s*\n([\s\S]*?)\n:::/g,
    (_: string, content: string) =>
      `<section style="background:#f0faf0;padding:15px 20px;border-left:4px solid #52a852;margin:1em 0;border-radius:4px">${content.trim()}</section>`
  );

  // :::speech ... ::: → dialogue block
  result = result.replace(
    /:::speech\s*\n([\s\S]*?)\n:::/g,
    (_: string, content: string) =>
      `<section style="background:#faf5ff;padding:15px 20px;border-left:4px solid #9b59b6;margin:1em 0;border-radius:4px">${content.trim()}</section>`
  );

  // Knb numbered section headers (e.g., "8   表格") → keep as-is, markdown handles
  // Tables separated by blank lines → standard markdown table

  return result;
}

/** Convert Markdown (including knb.im syntax) to WeChat-compatible HTML */
export function markdownToWechatHTML(markdown: string): string {
  // Pre-process custom syntax
  const preprocessed = preProcessKnb(markdown);

  // Use marked for standard Markdown
  const html = marked.parse(preprocessed, {
    async: false,
    gfm: true,
    breaks: true,
  });

  // Wrap in WeChat-friendly base styles
  const styled = (typeof html === "string" ? html : "")
    // Add default paragraph styles
    .replace(/<p>/g, '<p style="margin:0 0 0.8em;min-height:1.8em">')
    // Add heading styles
    .replace(/<h1>/g, '<h1 style="font-size:22px;font-weight:600;line-height:1.4;color:#333;margin:1.2em 0 0.5em;letter-spacing:0.02em">')
    .replace(/<h2>/g, '<h2 style="font-size:20px;font-weight:600;line-height:1.4;color:#333;margin:1.2em 0 0.5em;letter-spacing:0.02em">')
    .replace(/<h3>/g, '<h3 style="font-size:18px;font-weight:600;line-height:1.4;color:#333;margin:1.2em 0 0.5em;letter-spacing:0.02em">')
    // Code blocks → styled pre
    .replace(/<pre><code[^>]*>/g, '<pre style="background:rgba(0,0,0,0.04);padding:12px 16px;border-radius:4px;overflow-x:auto;font-size:14px;line-height:1.6;margin:1em 0"><code style="font-family:Courier New,Consolas,monospace;color:#333;background:none;padding:0">')
    .replace(/<\/code><\/pre>/g, "</code></pre>")
    // Inline code
    .replace(/<code>/g, '<code style="font-family:Courier New,Consolas,monospace;font-size:0.9em;background:rgba(0,0,0,0.04);padding:2px 6px;border-radius:3px;color:#c7254e">')
    // Remove empty lines between sections
    .replace(/\n{3,}/g, "\n\n");

  return styled;
}
