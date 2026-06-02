import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  SecurityContext,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { VbButtonComponent } from '../button/vb-button.component';
import { VbChipComponent } from '../chip/vb-chip.component';
import { VbTextLoaderComponent } from '../text-loader/vb-text-loader.component';
import { vbChatbotMarkdownToHtml } from './vb-chatbot-markdown';
import {
  VbChatbotHeaderStatus,
  VbChatbotLatencyTier,
  VbChatbotMessage,
  VbChatbotMessageFeedback,
  VbChatbotMessageFeedbackEvent,
  VbChatbotSource,
} from './vb-chatbot-message';

/** Emitted after a message body was copied to the clipboard. */
export interface VbChatbotMessageCopyEvent {
  messageId: string;
  messageIndex: number;
}

@Component({
  selector: 'vb-chatbot',
  standalone: true,
  imports: [NgClass, VbButtonComponent, VbChipComponent, VbTextLoaderComponent],
  templateUrl: './vb-chatbot.component.html',
  styleUrl: './vb-chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbChatbotComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly title = input('Assistant');
  readonly placeholder = input('Write a message...');
  readonly loading = input(false);
  readonly loadingText = input('Assistant is typing');
  readonly messages = input<VbChatbotMessage[]>([]);
  readonly sendAriaLabel = input('Send message');
  /** Accessible name for the clear-history action in the header. */
  readonly clearHistoryAriaLabel = input('Clear chat history');
  /** Places clear-history action in header next to status instead of composer. */
  readonly clearHistoryInHeader = input(false);
  /** Label shown before average assistant latency (seconds). */
  readonly latencyAverageLabel = input('Avg');
  /** Label shown before the latest assistant reply latency (seconds). */
  readonly latencyLastReplyLabel = input('Last reply');
  /** Accessible name for the citations list under assistant replies. */
  readonly sourcesAriaLabel = input('Sources');
  /** Upper bound (seconds) for {@link VbChatbotLatencyTier} `good` — inclusive. */
  readonly latencyGoodMaxSeconds = input(1.5);
  /** Upper bound (seconds) for `normal` — inclusive; must be ≥ {@link latencyGoodMaxSeconds}. */
  readonly latencyNormalMaxSeconds = input(4);
  /** Upper bound (seconds) for `acceptable` — inclusive; must be ≥ {@link latencyNormalMaxSeconds}. */
  readonly latencyAcceptableMaxSeconds = input(10);
  /** Optional status pill next to the title (e.g. Ready / Streaming…). */
  readonly chatStatus = input<VbChatbotHeaderStatus | null>(null);
  /** Keep composer disabled while any assistant message has `streaming: true`. */
  readonly composerLockedWhileStreaming = input(true);
  /**
   * Message area: tinted `surface-muted` / `surface-canvas` panel. Set `false` for a flat
   * default surface. When `true`, see {@link textureGrid} for the optional line overlay.
   */
  readonly textureBackdrop = input(true, { transform: booleanAttribute });
  /**
   * When {@link textureBackdrop} is on, draws the grid + diagonals + micro-dots overlay.
   * Set `false` for the tinted panel only (no pattern).
   */
  readonly textureGrid = input(true, { transform: booleanAttribute });
  /** Show like/dislike controls on completed assistant replies. */
  readonly messageFeedbackEnabled = input(true, { transform: booleanAttribute });
  readonly likeAriaLabel = input('Mark reply as helpful');
  readonly dislikeAriaLabel = input('Mark reply as not helpful');
  readonly messageFeedbackPrompt = input('Was this helpful?');
  readonly messageFeedbackHelpfulLabel = input('Helpful');
  readonly messageFeedbackNotHelpfulLabel = input('Not helpful');
  /** Accessible name for the per-message feedback button group. */
  readonly messageFeedbackAriaLabel = input('Rate this reply');
  /** Show an optional text field after the user selects dislike. */
  readonly dislikeFeedbackTextEnabled = input(true, { transform: booleanAttribute });
  readonly dislikeFeedbackLabel = input('What went wrong?');
  readonly dislikeFeedbackPlaceholder = input('Optional — how can we improve this reply?');
  readonly dislikeFeedbackSubmitLabel = input('Send feedback');
  /** Render completed assistant replies as Markdown (plain text while `streaming`). */
  readonly markdownEnabled = input(true, { transform: booleanAttribute });
  /** Scroll to the latest message when content grows, unless the user scrolled up. */
  readonly autoScrollEnabled = input(true, { transform: booleanAttribute });
  readonly scrollToBottomAriaLabel = input('Scroll to latest messages');
  readonly copyMessageAriaLabel = input('Copy message');
  readonly copiedMessageAriaLabel = input('Copied');

  readonly send = output<string>();
  readonly clearHistory = output<void>();
  readonly messageFeedback = output<VbChatbotMessageFeedbackEvent>();
  readonly messageCopy = output<VbChatbotMessageCopyEvent>();

  private readonly messagesViewport = viewChild<ElementRef<HTMLElement>>('messagesViewport');

  protected readonly draft = signal('');
  protected readonly stickToBottom = signal(true);
  protected readonly copiedMessageKey = signal<string | null>(null);

  protected readonly showScrollToBottom = computed(
    () => this.autoScrollEnabled() && !this.stickToBottom(),
  );

  protected readonly composerDisabled = computed(
    () =>
      this.loading() ||
      (this.composerLockedWhileStreaming() &&
        this.messages().some((m) => m.role === 'assistant' && m.streaming)),
  );
  protected readonly canSend = computed(() => this.draft().trim().length > 0 && !this.composerDisabled());
  protected readonly canClearHistory = computed(
    () =>
      this.messages().length > 0 &&
      !this.loading() &&
      !this.messages().some((m) => m.role === 'assistant' && m.streaming),
  );

  constructor() {
    effect(() => {
      this.messages();
      this.loading();
      if (!this.autoScrollEnabled() || !this.stickToBottom()) {
        return;
      }
      untracked(() => {
        queueMicrotask(() => this.scrollToBottom(false));
      });
    });
  }

  /** Mean of `responseLatencySeconds` over assistant messages that define it. */
  protected readonly averageAssistantLatencySeconds = computed(() => {
    const latencies = this.messages()
      .filter(
        (m): m is VbChatbotMessage & { responseLatencySeconds: number } =>
          m.role === 'assistant' &&
          m.responseLatencySeconds != null &&
          Number.isFinite(m.responseLatencySeconds),
      )
      .map((m) => m.responseLatencySeconds);
    if (!latencies.length) {
      return null;
    }
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  });

  /** Index of the last assistant message that carries `responseLatencySeconds`, or -1. */
  protected latestTimedAssistantIndex(): number {
    const msgs = this.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (
        m.role === 'assistant' &&
        m.responseLatencySeconds != null &&
        Number.isFinite(m.responseLatencySeconds)
      ) {
        return i;
      }
    }
    return -1;
  }

  protected onDraftInput(value: string): void {
    this.draft.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    if (!this.canSend()) {
      return;
    }
    this.send.emit(this.draft().trim());
    this.draft.set('');
  }

  protected clearMessages(): void {
    if (!this.canClearHistory()) {
      return;
    }
    this.clearHistory.emit();
  }

  protected onMessagesScroll(): void {
    const el = this.messagesViewport()?.nativeElement;
    if (!el) {
      return;
    }
    const thresholdPx = 56;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.stickToBottom.set(distanceFromBottom <= thresholdPx);
  }

  protected scrollToBottom(smooth: boolean): void {
    const el = this.messagesViewport()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    this.stickToBottom.set(true);
  }

  protected formatLatencySeconds(value: number): string {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  }

  protected averageLatencyTier(): VbChatbotLatencyTier | null {
    const avg = this.averageAssistantLatencySeconds();
    return avg == null ? null : this.latencyTier(avg);
  }

  /** Icon for average latency quality (tier is based on average reply time). */
  protected latencyAverageIcon(): string {
    switch (this.averageLatencyTier()) {
      case 'good':
        return 'bx bxs-happy-alt';
      case 'normal':
        return 'bx bxs-meh';
      case 'acceptable':
        return 'bx bxs-time-five';
      case 'bad':
        return 'bx bxs-error-circle';
      default:
        return 'bx bx-timer';
    }
  }

  /** Tooltip on citation chip (full URL; heading link and type are visible inline). */
  protected sourceChipTitle(src: VbChatbotSource): string {
    return `${src.pageTitle} — ${src.href}`;
  }

  protected latencyTier(seconds: number): VbChatbotLatencyTier {
    const g = this.latencyGoodMaxSeconds();
    const n = this.latencyNormalMaxSeconds();
    const a = this.latencyAcceptableMaxSeconds();
    const s = seconds;
    if (s <= g) {
      return 'good';
    }
    if (s <= n) {
      return 'normal';
    }
    if (s <= a) {
      return 'acceptable';
    }
    return 'bad';
  }

  /**
   * Compared to the previous timed assistant message: down = faster (better),
   * up = slower, flat = unchanged, none = no prior sample.
   */
  protected latencyTrendKind(idx: number): 'down' | 'up' | 'flat' | 'none' {
    const msgs = this.messages();
    const cur = msgs[idx];
    if (
      cur.role !== 'assistant' ||
      cur.responseLatencySeconds == null ||
      !Number.isFinite(cur.responseLatencySeconds)
    ) {
      return 'none';
    }
    let prev: number | null = null;
    for (let i = idx - 1; i >= 0; i--) {
      const m = msgs[i];
      if (
        m.role === 'assistant' &&
        m.responseLatencySeconds != null &&
        Number.isFinite(m.responseLatencySeconds)
      ) {
        prev = m.responseLatencySeconds;
        break;
      }
    }
    if (prev == null) {
      return 'none';
    }
    const eps = 0.06;
    const c = cur.responseLatencySeconds;
    if (c < prev - eps) {
      return 'down';
    }
    if (c > prev + eps) {
      return 'up';
    }
    return 'flat';
  }

  /** Boxicons class for trend glyph (paired with `vb-chatbot__latency-trend`). */
  protected latencyTrendIcon(idx: number): string {
    switch (this.latencyTrendKind(idx)) {
      case 'down':
        return 'bx bx-trending-down';
      case 'up':
        return 'bx bx-trending-up';
      default:
        return 'bx bx-minus';
    }
  }

  protected latencyTrendClass(idx: number): string {
    return `vb-chatbot__latency-trend--${this.latencyTrendKind(idx)}`;
  }

  protected latencyAverageColor(): string {
    switch (this.averageLatencyTier()) {
      case 'good':
        return 'var(--vb-color-action-primary)';
      case 'acceptable':
        return 'var(--vb-palette-amber-500)';
      case 'bad':
        return 'var(--vb-color-action-destructive)';
      case 'normal':
      default:
        return 'var(--vb-color-text-muted)';
    }
  }

  protected latencyTrendColor(idx: number): string {
    switch (this.latencyTrendKind(idx)) {
      case 'down':
        return 'var(--vb-color-action-primary)';
      case 'up':
        return 'var(--vb-color-action-destructive)';
      case 'flat':
      case 'none':
      default:
        return 'var(--vb-color-text-muted)';
    }
  }

  protected latencyTrendLabel(idx: number): string {
    switch (this.latencyTrendKind(idx)) {
      case 'down':
        return 'Faster than previous reply';
      case 'up':
        return 'Slower than previous reply';
      case 'flat':
        return 'Similar to previous reply';
      default:
        return 'No previous reply to compare';
    }
  }

  /** True when a user message appears earlier in the thread (not an opening assistant greeting). */
  protected hasPriorUserMessageBefore(index: number): boolean {
    for (let i = 0; i < index; i++) {
      if (this.messages()[i]?.role === 'user') {
        return true;
      }
    }
    return false;
  }

  protected isOpeningAssistantMessage(index: number): boolean {
    const message = this.messages()[index];
    return message?.role === 'assistant' && !this.hasPriorUserMessageBefore(index);
  }

  protected showMessageFeedback(message: VbChatbotMessage, index: number): boolean {
    return (
      this.messageFeedbackEnabled() &&
      message.role === 'assistant' &&
      !message.streaming &&
      this.hasPriorUserMessageBefore(index)
    );
  }

  protected hasLatencyBar(message: VbChatbotMessage): boolean {
    return (
      message.responseLatencySeconds != null &&
      this.averageAssistantLatencySeconds() != null &&
      Number.isFinite(message.responseLatencySeconds)
    );
  }

  protected canCopyMessage(message: VbChatbotMessage): boolean {
    return message.text.trim().length > 0 && !message.streaming;
  }

  protected showMessageHeader(message: VbChatbotMessage, index: number): boolean {
    if (message.role !== 'assistant' || this.isOpeningAssistantMessage(index)) {
      return false;
    }
    return (
      this.hasLatencyBar(message) ||
      this.showMessageFeedback(message, index) ||
      this.canCopyMessage(message)
    );
  }

  protected useMarkdownFor(message: VbChatbotMessage): boolean {
    return (
      this.markdownEnabled() &&
      message.role === 'assistant' &&
      !message.streaming &&
      message.text.trim().length > 0
    );
  }

  protected markdownHtml(text: string): string {
    const raw = vbChatbotMarkdownToHtml(text);
    return this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
  }

  protected feedbackIcon(choice: VbChatbotMessageFeedback, active: boolean): string {
    if (choice === 'like') {
      return active ? 'bx bxs-like' : 'bx bx-like';
    }
    return active ? 'bx bxs-dislike' : 'bx bx-dislike';
  }

  protected messageKey(message: VbChatbotMessage, index: number): string {
    return message.id ?? String(index);
  }

  protected isMessageCopied(message: VbChatbotMessage, index: number): boolean {
    return this.copiedMessageKey() === this.messageKey(message, index);
  }

  protected copyAriaLabel(message: VbChatbotMessage, index: number): string {
    return this.isMessageCopied(message, index)
      ? this.copiedMessageAriaLabel()
      : this.copyMessageAriaLabel();
  }

  protected async copyMessage(message: VbChatbotMessage, index: number): Promise<void> {
    if (!this.canCopyMessage(message)) {
      return;
    }
    const key = this.messageKey(message, index);
    try {
      await navigator.clipboard.writeText(message.text);
      this.copiedMessageKey.set(key);
      this.messageCopy.emit({ messageId: key, messageIndex: index });
      window.setTimeout(() => {
        if (this.copiedMessageKey() === key) {
          this.copiedMessageKey.set(null);
        }
      }, 1600);
    } catch {
      /* clipboard denied — host may offer a fallback */
    }
  }

  protected showDislikeFeedbackForm(message: VbChatbotMessage, index: number): boolean {
    return (
      this.dislikeFeedbackTextEnabled() &&
      message.feedback === 'dislike' &&
      this.showMessageFeedback(message, index)
    );
  }

  protected dislikeCommentInputId(message: VbChatbotMessage, index: number): string {
    return `vb-chatbot-dislike-${this.messageKey(message, index)}`;
  }

  protected onMessageFeedbackClick(
    message: VbChatbotMessage,
    index: number,
    choice: VbChatbotMessageFeedback,
  ): void {
    const current = message.feedback ?? null;
    const feedback = current === choice ? null : choice;
    let feedbackComment: string | null = null;
    if (feedback === 'dislike') {
      feedbackComment =
        current === 'dislike' ? (message.feedbackComment?.trim() || null) : null;
    }
    this.messageFeedback.emit({
      messageId: this.messageKey(message, index),
      messageIndex: index,
      feedback,
      feedbackComment,
    });
  }

  protected commitDislikeComment(
    message: VbChatbotMessage,
    index: number,
    rawValue: string,
  ): void {
    if (message.feedback !== 'dislike') {
      return;
    }
    const feedbackComment = rawValue.trim() || null;
    const prev = message.feedbackComment?.trim() || null;
    if (feedbackComment === prev) {
      return;
    }
    this.messageFeedback.emit({
      messageId: this.messageKey(message, index),
      messageIndex: index,
      feedback: 'dislike',
      feedbackComment,
    });
  }

  protected onDislikeCommentKeydown(
    event: KeyboardEvent,
    message: VbChatbotMessage,
    index: number,
  ): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const el = event.target as HTMLTextAreaElement;
      this.commitDislikeComment(message, index, el.value);
      el.blur();
    }
  }
}
