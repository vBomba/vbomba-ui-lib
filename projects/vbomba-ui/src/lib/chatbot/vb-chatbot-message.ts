export type VbChatRole = 'user' | 'assistant' | 'system';

/** CSS tier for styling latency bars (`vb-chatbot__latency-bar--*`). */
export type VbChatbotLatencyTier = 'good' | 'normal' | 'acceptable' | 'bad';

/** Visual tone for the optional header status pill (`vb-chatbot__header-status--*`). */
export type VbChatbotHeaderStatusTone = 'idle' | 'streaming' | 'thinking' | 'busy' | 'error' | 'offline';

/** Shown next to the chat title (connection / streaming / idle state). */
export interface VbChatbotHeaderStatus {
  label: string;
  tone?: VbChatbotHeaderStatusTone;
}

/** One retrieval source shown under an assistant reply (RAG / citations). */
export interface VbChatbotSource {
  href: string;
  pageTitle: string;
  chunkType: string;
}

export interface VbChatbotMessage {
  id?: string;
  role: VbChatRole;
  text: string;
  /** Assistant only: how long this reply took to produce, in seconds (for latency UI). */
  responseLatencySeconds?: number;
  /** Assistant only: compact citations (link, page title, chunk type). */
  sources?: VbChatbotSource[];
  /**
   * Assistant only: reply text is still arriving (token/word stream). Enables caret animation
   * and optional composer lock until cleared.
   */
  streaming?: boolean;
}
