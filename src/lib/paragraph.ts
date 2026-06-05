/**
 * 段落锚点注入工具
 *
 * 解析 HTML 内容，为每个 <p> 标签注入 data-p-id 属性，
 * 用于段评系统的段落定位。
 *
 * 注意：此操作在文章发布时的服务端执行。
 */

export interface ParagraphAnchor {
  pOrder: number;
  pHash: string;
}

export function injectParagraphAnchors(
  html: string,
  articleId: string
): { html: string; anchors: ParagraphAnchor[] } {
  const anchors: ParagraphAnchor[] = [];
  let order = 0;

  // 用正则匹配所有 <p> 标签（简化版，不处理嵌套 <p>）
  const result = html.replace(/<p(\s[^>]*)?>/gi, (match, attrs) => {
    const slug = `aid-${articleId}-p-${order}`;
    // 移除已有的 data-p-id（如果存在）
    const cleanAttrs = (attrs || "").replace(/\s*data-p-id="[^"]*"/gi, "");
    anchors.push({ pOrder: order, pHash: slug });
    order++;
    return `<p${cleanAttrs} data-p-id="${slug}">`;
  });

  return { html: result, anchors };
}

/**
 * 提取纯文本字数（中文 + 英文单词）
 */
export function countChineseChars(text: string): number {
  // 去除 HTML 标签
  const plain = text.replace(/<[^>]*>/g, "");
  // 去除空白字符
  const trimmed = plain.replace(/\s+/g, "");
  return trimmed.length;
}

/**
 * 计算阅读时间（分钟）
 * 中文阅读速度约 500 字/分钟
 */
export function estimateReadingTime(html: string): number {
  const chars = countChineseChars(html);
  const minutes = Math.ceil(chars / 500);
  return Math.max(1, minutes);
}
