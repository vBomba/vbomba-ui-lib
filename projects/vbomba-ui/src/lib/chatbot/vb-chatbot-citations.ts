/**
 * Helpers for RAG citation markers (`[n]`) and multi-fragment source cards.
 */

const CITE_TITLE_PREFIX = /^\[([\d,\s]+)\]\s+/;

/** Parse `[1]` or `[1, 2]` prefix from a source chip title (DocBot compat). */
export function vbChatbotParseCiteIndexesFromTitle(pageTitle: string): number[] | null {
  const match = pageTitle.match(CITE_TITLE_PREFIX);
  if (!match) {
    return null;
  }
  const nums = match[1]
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length ? nums : null;
}

/** Format a fragment score for display (3 decimal places). */
export function vbChatbotFormatSourceScore(score: number): string {
  return score.toFixed(3);
}

/**
 * Wrap bare `[n]` / `[n, m]` markers in HTML as citation superscripts.
 * Skips markers that are already inside tags (e.g. existing links).
 */
export function vbChatbotWrapCitationMarkers(html: string): string {
  if (!html) {
    return html;
  }
  return html.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (match, numbers: string, offset: number) => {
    // Skip if this `[` sits inside an HTML tag attribute/body open.
    const before = html.slice(Math.max(0, offset - 1), offset);
    if (before === '=' || before === '"' || before === "'") {
      return match;
    }
    const openLt = html.lastIndexOf('<', offset);
    const openGt = html.lastIndexOf('>', offset);
    if (openLt > openGt) {
      return match;
    }

    const ids = numbers
      .split(',')
      .map((part) => part.trim())
      .filter((part) => /^\d+$/.test(part));
    if (!ids.length) {
      return match;
    }
    return ids
      .map(
        (id) =>
          `<sup class="vb-chatbot__cite-ref vb-chatbot__cite-n-${id}" data-cite="${id}">[${id}]</sup>`,
      )
      .join('');
  });
}

/** Default English summary for a collapsible sources block. */
export function vbChatbotDefaultSourcesSummary(count: number): string {
  if (count === 1) {
    return '1 source';
  }
  return `${count} sources`;
}
