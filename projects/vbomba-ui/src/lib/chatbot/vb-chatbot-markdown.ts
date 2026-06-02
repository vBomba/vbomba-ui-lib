import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  /** `false` — only blank lines start new blocks; avoids extra `<br>` in chat replies. */
  breaks: false,
});

/** Trims and caps consecutive newlines before parsing. */
export function vbChatbotNormalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Converts assistant markdown to HTML (sanitize in the component before binding). */
export function vbChatbotMarkdownToHtml(text: string): string {
  const normalized = vbChatbotNormalizeMarkdown(text);
  if (!normalized) {
    return '';
  }
  const html = marked.parse(normalized, { async: false }) as string;
  return html.replace(/<p>(\s|&nbsp;)*<\/p>/gi, '');
}
