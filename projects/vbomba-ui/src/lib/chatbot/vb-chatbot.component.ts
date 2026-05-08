import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { VbButtonComponent } from '../button/vb-button.component';
import { VbChipComponent } from '../chip/vb-chip.component';
import { VbTextLoaderComponent } from '../text-loader/vb-text-loader.component';
import {
  VbChatbotHeaderStatus,
  VbChatbotLatencyTier,
  VbChatbotMessage,
  VbChatbotSource,
} from './vb-chatbot-message';

@Component({
  selector: 'vb-chatbot',
  standalone: true,
  imports: [NgClass, VbButtonComponent, VbChipComponent, VbTextLoaderComponent],
  templateUrl: './vb-chatbot.component.html',
  styleUrl: './vb-chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbChatbotComponent {
  readonly title = input('Assistant');
  readonly placeholder = input('Write a message...');
  readonly loading = input(false);
  readonly loadingText = input('Assistant is typing');
  readonly messages = input<VbChatbotMessage[]>([]);
  readonly sendAriaLabel = input('Send message');
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

  readonly send = output<string>();

  protected readonly draft = signal('');
  protected readonly composerDisabled = computed(
    () =>
      this.loading() ||
      (this.composerLockedWhileStreaming() &&
        this.messages().some((m) => m.role === 'assistant' && m.streaming)),
  );
  protected readonly canSend = computed(() => this.draft().trim().length > 0 && !this.composerDisabled());

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
}
