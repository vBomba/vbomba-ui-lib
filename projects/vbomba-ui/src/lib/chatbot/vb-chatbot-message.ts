export type VbChatRole = 'user' | 'assistant' | 'system';

/** Thumbs up / down on an assistant reply (`null` = cleared). */
export type VbChatbotMessageFeedback = 'like' | 'dislike';

/** Emitted when the user rates an assistant message. */
export interface VbChatbotMessageFeedbackEvent {
  /** `message.id` when set, otherwise the message index as a string. */
  messageId: string;
  messageIndex: number;
  feedback: VbChatbotMessageFeedback | null;
  /**
   * Optional note when `feedback` is `dislike` (omit or `null` when cleared / liked).
   * Host should persist on {@link VbChatbotMessage.feedbackComment}.
   */
  feedbackComment?: string | null;
}

/** CSS tier for styling latency bars (`vb-chatbot__latency-bar--*`). */
export type VbChatbotLatencyTier = 'good' | 'normal' | 'acceptable' | 'bad';

/** Visual tone for the optional header status pill (`vb-chatbot__header-status--*`). */
export type VbChatbotHeaderStatusTone = 'idle' | 'streaming' | 'thinking' | 'busy' | 'error' | 'offline';

/** Shown next to the chat title (connection / streaming / idle state). */
export interface VbChatbotHeaderStatus {
  label: string;
  tone?: VbChatbotHeaderStatusTone;
}

/**
 * One retrieval source shown under an assistant reply (RAG / citations).
 * Composer picks use {@link VbChatbotComposerAttachment} instead.
 */
export interface VbChatbotSourceFragment {
  /** Chunk / section label (e.g. "Text", "Table"). */
  label: string;
  /** Optional relevance score shown next to the label. */
  score?: number;
}

export interface VbChatbotSource {
  href: string;
  pageTitle: string;
  /**
   * Legacy single-line type label when {@link fragments} is omitted.
   * Prefer `fragments` for multi-row DocBot-style cards.
   */
  chunkType: string;
  /** Citation index for `[n]` markers in the answer body. */
  citeIndex?: number;
  /** Optional overall page score. */
  score?: number;
  /** Multi-fragment rows under the title (highest-score first recommended). */
  fragments?: VbChatbotSourceFragment[];
}

/** Kind of a composer attachment chip. */
export type VbChatbotComposerAttachmentKind = 'source' | 'rule' | 'role';

/**
 * An option the user can attach via `@` mention in the composer
 * (sources or the single role). Filtered by substring on `label` / `description`.
 */
export interface VbChatbotSourceOption {
  /** Semantic id — stored on {@link VbChatbotComposerAttachment.value}. */
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Chip shown inside the composer field (and optionally on a sent user message).
 * `kind: 'source'` — knowledge page; `kind: 'rule'` — instruction; `kind: 'role'` — persona (at most one).
 */
export interface VbChatbotComposerAttachment {
  /** Unique instance id for this chip (not the page/rule/role id). */
  id: string;
  kind: VbChatbotComposerAttachmentKind;
  /** Semantic id (page id, rule id, role id). */
  value: string;
  label: string;
  description?: string;
}

/** Payload from the composer send action. */
export interface VbChatbotSendEvent {
  text: string;
  attachments: VbChatbotComposerAttachment[];
}

export interface VbChatbotMessage {
  id?: string;
  role: VbChatRole;
  text: string;
  /** Optional composer attachments echoed on a user message. */
  attachments?: VbChatbotComposerAttachment[];
  /** Assistant only: how long this reply took to produce, in seconds (for latency UI). */
  responseLatencySeconds?: number;
  /** Assistant only: compact citations (link, page title, chunk type). */
  sources?: VbChatbotSource[];
  /**
   * Assistant only: reply text is still arriving (token/word stream). Enables caret animation
   * and optional composer lock until cleared.
   */
  streaming?: boolean;
  /** Assistant only: user's like/dislike on this reply. Omit or `null` when unset. */
  feedback?: VbChatbotMessageFeedback | null;
  /** Assistant only: optional text when `feedback` is `dislike`. */
  feedbackComment?: string | null;
}
