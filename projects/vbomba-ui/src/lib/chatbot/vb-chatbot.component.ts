import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  SecurityContext,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { VbButtonComponent } from '../button/vb-button.component';
import { VbChipComponent } from '../chip/vb-chip.component';
import { VbSelectComponent, type VbSelectOption } from '../select/vb-select.component';
import { VbTextLoaderComponent } from '../text-loader/vb-text-loader.component';
import { vbChatbotMarkdownToHtml } from './vb-chatbot-markdown';
import {
  vbChatbotDefaultSourcesSummary,
  vbChatbotFormatSourceScore,
  vbChatbotParseCiteIndexesFromTitle,
  vbChatbotWrapCitationMarkers,
} from './vb-chatbot-citations';
import {
  VbChatbotComposerAttachment,
  VbChatbotComposerAttachmentKind,
  VbChatbotHeaderStatus,
  VbChatbotLatencyTier,
  VbChatbotMessage,
  VbChatbotMessageFeedback,
  VbChatbotMessageFeedbackEvent,
  VbChatbotSendEvent,
  VbChatbotSource,
  VbChatbotSourceFragment,
  VbChatbotSourceOption,
} from './vb-chatbot-message';

/** Emitted after a message body was copied to the clipboard. */
export interface VbChatbotMessageCopyEvent {
  messageId: string;
  messageIndex: number;
}

interface VbChatbotSourceMention {
  /** Index of `@` in the draft. */
  start: number;
  /** Caret / end of the query token. */
  end: number;
  /** Text after `@` (no whitespace). */
  query: string;
}

/** Unified `@` suggestion row (source page or role). */
interface VbChatbotMentionMatch extends VbChatbotSourceOption {
  kind: 'source' | 'role';
}

/** One labeled block in the `@` mention menu (Roles / Sources). */
interface VbChatbotMentionGroup {
  kind: 'role' | 'source';
  label: string;
  items: readonly (VbChatbotMentionMatch & { flatIndex: number })[];
}

export type { VbSelectOption as VbChatbotConversationOption };

@Component({
  selector: 'vb-chatbot',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    VbButtonComponent,
    VbChipComponent,
    VbSelectComponent,
    VbTextLoaderComponent,
  ],
  templateUrl: './vb-chatbot.component.html',
  styleUrl: './vb-chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbChatbotComponent implements AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly title = input('Assistant');
  /** Optional composer placeholder. Empty string hides the placeholder. */
  readonly placeholder = input('');
  readonly loading = input(false);
  readonly loadingText = input('Assistant is typing');
  readonly messages = input<VbChatbotMessage[]>([]);
  readonly sendAriaLabel = input('Send message');
  /** Accessible name for the clear-history action in the header. */
  readonly clearHistoryAriaLabel = input('Clear chat history');
  /** Places clear-history action in header next to status instead of composer. */
  readonly clearHistoryInHeader = input(false);
  /**
   * Conversation list for the header switcher (`vb-select`).
   * When non-empty, the title is replaced by the select + new-conversation control.
   */
  readonly conversations = input<VbSelectOption[]>([]);
  /** Two-way bound active conversation id (matches an option `value`). */
  readonly conversationId = model<string>('');
  readonly conversationPlaceholder = input('Select a conversation');
  readonly conversationAriaLabel = input('Conversation');
  readonly newConversationAriaLabel = input('New conversation');
  /** Boxicons class for the new-conversation header button. */
  readonly newConversationIconClass = input('bx bx-plus');
  /**
   * Attachment chips inside the composer.
   * Two-way so the host can insert from a picker.
   */
  readonly attachments = model<VbChatbotComposerAttachment[]>([]);
  /**
   * Which attachment kinds the composer supports.
   * Default: sources + role via `@`. Include `'rule'` for the add-rule button.
   */
  readonly composerAttachmentKinds = input<readonly VbChatbotComposerAttachmentKind[]>([
    'source',
    'role',
  ]);
  readonly attachmentsAriaLabel = input('Message attachments');
  readonly addRuleAriaLabel = input('Add rule');
  readonly addRuleIconClass = input('bx bx-slider-alt');
  /**
   * Pages / docs available for `@` mention in the composer.
   * Matched by substring on `label` and `description` against the text after `@`.
   */
  readonly sourceOptions = input<readonly VbChatbotSourceOption[]>([]);
  /**
   * Optional single role available via `@` mention.
   * At most one role chip can be attached at a time.
   */
  readonly roleOption = input<VbChatbotSourceOption | null>(null);
  /** Max source rows shown in the `@` suggestion list (the role row is not capped by this). */
  readonly sourceMentionLimit = input(6);
  readonly sourceMentionAriaLabel = input('Mention suggestions');
  readonly sourceMentionEmptyLabel = input('No matching mentions');
  /** Section header above the role row in the `@` menu. */
  readonly roleMentionGroupLabel = input('Roles');
  /** Section header above source rows in the `@` menu. */
  readonly sourceMentionGroupLabel = input('Sources');
  /** Label shown before average assistant latency (seconds). */
  readonly latencyAverageLabel = input('Avg');
  /** Label shown before the latest assistant reply latency (seconds). */
  readonly latencyLastReplyLabel = input('Last reply');
  /** Accessible name for the citations list under assistant replies. */
  readonly sourcesAriaLabel = input('Sources');
  /**
   * Wrap the sources list in a `<details>` disclosure (DocBot-style).
   * Summary text from {@link sourcesSummaryLabel} or the default English count label.
   */
  readonly sourcesCollapsible = input(false, { transform: booleanAttribute });
  /** When collapsible, start collapsed (default true). */
  readonly sourcesCollapsedByDefault = input(true, { transform: booleanAttribute });
  /**
   * Optional summary factory for the collapsible sources header.
   * Receives the source count; return a localized string (e.g. Polish plurals).
   */
  readonly sourcesSummaryLabel = input<((count: number) => string | null) | null>(null);
  /**
   * Turn bare `[n]` markers in markdown replies into citation superscripts that
   * highlight matching source chips on hover.
   */
  readonly citationMarkersEnabled = input(true, { transform: booleanAttribute });
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

  readonly send = output<VbChatbotSendEvent>();
  readonly clearHistory = output<void>();
  readonly messageFeedback = output<VbChatbotMessageFeedbackEvent>();
  readonly messageCopy = output<VbChatbotMessageCopyEvent>();
  /** Host should create a conversation, update `conversations` / `conversationId` / `messages`. */
  readonly newConversation = output<void>();
  /**
   * Host should open a picker for the given kind and push into `attachments`.
   * Sources and role use `@` + {@link sourceOptions} / {@link roleOption}; this output is mainly for `'rule'`.
   */
  readonly openAttachmentPicker = output<VbChatbotComposerAttachmentKind>();

  private readonly messagesViewport = viewChild<ElementRef<HTMLElement>>('messagesViewport');
  private readonly composerInput = viewChild<ElementRef<HTMLElement>>('composerInput');
  /** Skip reading DOM while programmatically writing composer text. */
  private composerDomWrite = false;

  protected readonly draft = signal('');
  protected readonly caretIndex = signal(0);
  protected readonly stickToBottom = signal(true);
  protected readonly copiedMessageKey = signal<string | null>(null);
  protected readonly mentionHighlight = signal(0);
  /** Suppress the mention menu until the active `@` query changes (e.g. after Escape). */
  private readonly mentionSuppressedQuery = signal<string | null>(null);
  /** Active `[n]` citation id under the pointer (highlights matching source chips). */
  protected readonly activeCitation = signal<string | null>(null);

  protected readonly showScrollToBottom = computed(
    () => this.autoScrollEnabled() && !this.stickToBottom(),
  );

  protected readonly showConversationSwitcher = computed(() => this.conversations().length > 0);

  protected readonly sourceMentionEnabled = computed(() =>
    this.composerAttachmentKinds().includes('source'),
  );

  protected readonly roleMentionEnabled = computed(
    () => this.composerAttachmentKinds().includes('role') && !!this.roleOption(),
  );

  protected readonly showAddRule = computed(() => this.composerAttachmentKinds().includes('rule'));

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
  protected readonly conversationControlsDisabled = computed(() => this.composerDisabled());
  protected readonly attachmentControlsDisabled = computed(() => this.composerDisabled());

  protected readonly activeSourceMention = computed<VbChatbotSourceMention | null>(() => {
    if (this.attachmentControlsDisabled()) {
      return null;
    }
    if (!this.sourceMentionEnabled() && !this.roleMentionEnabled()) {
      return null;
    }
    if (!this.sourceOptions().length && !this.roleOption()) {
      return null;
    }
    return this.parseSourceMention(this.draft(), this.caretIndex());
  });

  protected readonly mentionMatches = computed(() => {
    const mention = this.activeSourceMention();
    if (!mention) {
      return [] as VbChatbotMentionMatch[];
    }
    const suppressed = this.mentionSuppressedQuery();
    if (suppressed != null && suppressed === mention.query) {
      return [] as VbChatbotMentionMatch[];
    }
    const q = mention.query.toLowerCase();
    const matchesQuery = (opt: VbChatbotSourceOption) =>
      !q ||
      opt.label.toLowerCase().includes(q) ||
      (opt.description?.toLowerCase().includes(q) ?? false);

    const roles: VbChatbotMentionMatch[] = [];
    if (this.roleMentionEnabled()) {
      const role = this.roleOption();
      if (role && !role.disabled && matchesQuery(role)) {
        roles.push({ ...role, kind: 'role' });
      }
    }

    const sources: VbChatbotMentionMatch[] = [];
    if (this.sourceMentionEnabled()) {
      const limit = Math.max(1, this.sourceMentionLimit());
      for (const opt of this.sourceOptions()) {
        if (sources.length >= limit) {
          break;
        }
        if (!opt.disabled && matchesQuery(opt)) {
          sources.push({ ...opt, kind: 'source' });
        }
      }
    }

    return [...roles, ...sources];
  });

  /** Roles / Sources sections for the `@` menu (empty groups omitted). */
  protected readonly mentionGroups = computed((): VbChatbotMentionGroup[] => {
    const matches = this.mentionMatches();
    if (!matches.length) {
      return [];
    }
    const groups: VbChatbotMentionGroup[] = [];
    const pushGroup = (kind: 'role' | 'source', label: string) => {
      const items = matches
        .map((m, flatIndex) => ({ ...m, flatIndex }))
        .filter((m) => m.kind === kind);
      if (items.length) {
        groups.push({ kind, label, items });
      }
    };
    pushGroup('role', this.roleMentionGroupLabel());
    pushGroup('source', this.sourceMentionGroupLabel());
    return groups;
  });

  protected readonly showMentionMenu = computed(() => {
    const mention = this.activeSourceMention();
    if (!mention) {
      return false;
    }
    const suppressed = this.mentionSuppressedQuery();
    if (suppressed != null && suppressed === mention.query) {
      return false;
    }
    return true;
  });

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

    effect(() => {
      this.conversationId();
      untracked(() => {
        this.draft.set('');
        this.caretIndex.set(0);
        this.attachments.set([]);
        this.stickToBottom.set(true);
        this.copiedMessageKey.set(null);
        this.mentionHighlight.set(0);
        this.mentionSuppressedQuery.set(null);
        queueMicrotask(() => this.writeComposerText(''));
      });
    });

    effect(() => {
      this.mentionMatches();
      untracked(() => this.mentionHighlight.set(0));
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.writeComposerText(this.draft()));
  }

  protected requestNewConversation(): void {
    if (this.conversationControlsDisabled()) {
      return;
    }
    this.newConversation.emit();
  }

  protected requestOpenAttachmentPicker(kind: VbChatbotComposerAttachmentKind): void {
    if (this.attachmentControlsDisabled()) {
      return;
    }
    if (!this.composerAttachmentKinds().includes(kind)) {
      return;
    }
    this.openAttachmentPicker.emit(kind);
  }

  protected removeAttachment(attachmentId: string): void {
    if (this.attachmentControlsDisabled()) {
      return;
    }
    this.attachments.update((items) => items.filter((item) => item.id !== attachmentId));
  }

  protected attachmentIcon(kind: VbChatbotComposerAttachmentKind): string {
    if (kind === 'rule') {
      return 'bx bx-slider-alt';
    }
    if (kind === 'role') {
      return 'bx bx-user';
    }
    return 'bx bx-book';
  }

  protected attachmentTitle(att: VbChatbotComposerAttachment): string {
    const kindLabel = att.kind === 'rule' ? 'Rule' : att.kind === 'role' ? 'Role' : 'Source';
    return att.description?.trim()
      ? `${kindLabel}: ${att.label} — ${att.description}`
      : `${kindLabel}: ${att.label}`;
  }

  /** Role chips first (left), then sources/rules in original order. */
  protected orderedAttachments(
    items: readonly VbChatbotComposerAttachment[] | null | undefined,
  ): VbChatbotComposerAttachment[] {
    if (!items?.length) {
      return [];
    }
    const roles: VbChatbotComposerAttachment[] = [];
    const rest: VbChatbotComposerAttachment[] = [];
    for (const att of items) {
      if (att.kind === 'role') {
        roles.push(att);
      } else {
        rest.push(att);
      }
    }
    return [...roles, ...rest];
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

  protected onComposerInput(): void {
    if (this.composerDomWrite) {
      return;
    }
    const el = this.composerInput()?.nativeElement;
    if (!el) {
      return;
    }
    const text = this.readComposerText(el);
    this.draft.set(text);
    if (!text.trim() && el.innerHTML !== '<br>') {
      this.writeComposerText('');
    }
    this.syncComposerCaret();
    this.clearMentionSuppressIfQueryChanged();
  }

  protected onComposerPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (!text || this.composerDisabled()) {
      return;
    }
    this.insertComposerText(text);
  }

  protected syncComposerCaret(): void {
    const el = this.composerInput()?.nativeElement;
    if (!el) {
      return;
    }
    this.caretIndex.set(this.getComposerCaretOffset(el));
    this.clearMentionSuppressIfQueryChanged();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.showMentionMenu() && this.handleMentionKeydown(event)) {
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
      return;
    }
    if (event.key === 'Backspace' && this.tryRemoveChipOnBackspace(event)) {
      return;
    }
  }

  /** When caret is at the start of the text, Backspace removes the last chip. */
  private tryRemoveChipOnBackspace(event: KeyboardEvent): boolean {
    if (this.attachmentControlsDisabled()) {
      return false;
    }
    const el = this.composerInput()?.nativeElement;
    if (!el) {
      return false;
    }
    const offset = this.getComposerCaretOffset(el);
    const sel = document.getSelection();
    if (offset !== 0 || !sel || !sel.isCollapsed) {
      return false;
    }
    const chips = this.orderedAttachments(this.attachments());
    if (!chips.length) {
      return false;
    }
    event.preventDefault();
    this.removeAttachment(chips[chips.length - 1]!.id);
    return true;
  }

  private handleMentionKeydown(event: KeyboardEvent): boolean {
    const matches = this.mentionMatches();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!matches.length) {
        return true;
      }
      this.mentionHighlight.update((i) => (i + 1) % matches.length);
      return true;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!matches.length) {
        return true;
      }
      this.mentionHighlight.update((i) => (i - 1 + matches.length) % matches.length);
      return true;
    }
    if ((event.key === 'Enter' || event.key === 'Tab') && matches.length) {
      event.preventDefault();
      this.applyMention(matches[this.mentionHighlight()] ?? matches[0]);
      return true;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      const mention = this.activeSourceMention();
      this.mentionSuppressedQuery.set(mention?.query ?? '');
      return true;
    }
    return false;
  }

  protected applyMention(option: VbChatbotMentionMatch, event?: Event): void {
    event?.preventDefault();
    if (option.disabled || this.attachmentControlsDisabled()) {
      return;
    }
    const mention = this.activeSourceMention();
    if (!mention) {
      return;
    }
    const draft = this.draft();
    const next = draft.slice(0, mention.start) + draft.slice(mention.end);
    this.draft.set(next);
    this.writeComposerText(next);
    this.caretIndex.set(mention.start);
    this.mentionSuppressedQuery.set(null);
    this.mentionHighlight.set(0);

    this.attachments.update((items) => {
      if (option.kind === 'role') {
        const withoutRole = items.filter((att) => att.kind !== 'role');
        // Role chip always leads (leftmost) in the composer / bubble.
        return [
          {
            id: `role-${option.value}-${Date.now()}`,
            kind: 'role',
            value: option.value,
            label: option.label,
            description: option.description,
          },
          ...withoutRole,
        ];
      }
      const withoutSame = items.filter(
        (att) => !(att.kind === 'source' && att.value === option.value),
      );
      return [
        ...withoutSame,
        {
          id: `src-${option.value}-${Date.now()}`,
          kind: 'source',
          value: option.value,
          label: option.label,
          description: option.description,
        },
      ];
    });

    queueMicrotask(() => {
      const input = this.composerInput()?.nativeElement;
      if (!input) {
        return;
      }
      input.focus();
      this.setComposerCaretOffset(input, mention.start);
      this.caretIndex.set(mention.start);
    });
  }

  private clearMentionSuppressIfQueryChanged(): void {
    const suppressed = this.mentionSuppressedQuery();
    if (suppressed == null) {
      return;
    }
    const mention = this.parseSourceMention(this.draft(), this.caretIndex());
    if (!mention || mention.query !== suppressed) {
      this.mentionSuppressedQuery.set(null);
    }
  }

  private readComposerText(el: HTMLElement): string {
    let text = el.innerText ?? '';
    if (text.endsWith('\n')) {
      text = text.slice(0, -1);
    }
    return text;
  }

  private writeComposerText(text: string): void {
    const el = this.composerInput()?.nativeElement;
    if (!el) {
      return;
    }
    this.composerDomWrite = true;
    if (text) {
      el.textContent = text;
    } else {
      // Keep a caret target when empty (contenteditable collapses without content).
      el.innerHTML = '<br>';
    }
    this.composerDomWrite = false;
  }

  private insertComposerText(text: string): void {
    const el = this.composerInput()?.nativeElement;
    if (!el) {
      return;
    }
    el.focus();
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) {
      const next = this.draft() + text;
      this.draft.set(next);
      this.writeComposerText(next);
      this.setComposerCaretOffset(el, next.length);
      this.caretIndex.set(next.length);
      this.clearMentionSuppressIfQueryChanged();
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    this.draft.set(this.readComposerText(el));
    this.syncComposerCaret();
    this.clearMentionSuppressIfQueryChanged();
  }

  private getComposerCaretOffset(el: HTMLElement): number {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return this.draft().length;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) {
      return this.draft().length;
    }
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  }

  private setComposerCaretOffset(el: HTMLElement, offset: number): void {
    const sel = document.getSelection();
    if (!sel) {
      return;
    }
    let remaining = Math.max(0, offset);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode() as Text | null;
    while (textNode) {
      const len = textNode.data.length;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(textNode, remaining);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= len;
      textNode = walker.nextNode() as Text | null;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(offset === 0);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  private parseSourceMention(text: string, caret: number): VbChatbotSourceMention | null {
    const pos = Math.max(0, Math.min(caret, text.length));
    let i = pos - 1;
    while (i >= 0) {
      const ch = text.charAt(i);
      if (ch === '@') {
        if (!this.canStartSourceMention(text, i)) {
          return null;
        }
        const query = text.slice(i + 1, pos);
        if (/\s/.test(query)) {
          return null;
        }
        return { start: i, end: pos, query };
      }
      if (/\s/.test(ch)) {
        return null;
      }
      i -= 1;
    }
    return null;
  }

  private canStartSourceMention(text: string, atIndex: number): boolean {
    if (atIndex <= 0) {
      return true;
    }
    return /\s/.test(text.charAt(atIndex - 1));
  }

  protected submit(): void {
    if (!this.canSend()) {
      return;
    }
    this.send.emit({
      text: this.draft().trim(),
      attachments: this.orderedAttachments(this.attachments()),
    });
    this.draft.set('');
    this.writeComposerText('');
    this.caretIndex.set(0);
    this.attachments.set([]);
    this.mentionHighlight.set(0);
    this.mentionSuppressedQuery.set(null);
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

  protected sourceFragments(src: VbChatbotSource): VbChatbotSourceFragment[] {
    if (src.fragments?.length) {
      return src.fragments;
    }
    const label = src.chunkType?.trim();
    return label ? [{ label }] : [];
  }

  protected sourceCiteIndexes(src: VbChatbotSource): number[] {
    if (src.citeIndex != null && Number.isFinite(src.citeIndex) && src.citeIndex > 0) {
      return [src.citeIndex];
    }
    return vbChatbotParseCiteIndexesFromTitle(src.pageTitle) ?? [];
  }

  protected sourceCiteRefsAttr(src: VbChatbotSource): string | null {
    const indexes = this.sourceCiteIndexes(src);
    return indexes.length ? indexes.join(',') : null;
  }

  protected isSourceCiteHighlighted(src: VbChatbotSource): boolean {
    const active = this.activeCitation();
    if (!active) {
      return false;
    }
    return this.sourceCiteIndexes(src).some((n) => String(n) === active);
  }

  protected formatSourceScore(score: number): string {
    return vbChatbotFormatSourceScore(score);
  }

  protected sourcesSummary(count: number): string {
    const custom = this.sourcesSummaryLabel()?.(count);
    if (custom?.trim()) {
      return custom.trim();
    }
    return vbChatbotDefaultSourcesSummary(count);
  }

  protected onMarkdownMouseOver(event: MouseEvent): void {
    if (!this.citationMarkersEnabled()) {
      return;
    }
    const citeEl = (event.target as HTMLElement | null)?.closest(
      '.vb-chatbot__cite-ref',
    ) as HTMLElement | null;
    const cite = this.resolveCiteId(citeEl);
    if (!cite || this.activeCitation() === cite) {
      return;
    }
    this.setActiveCitation(cite, (event.currentTarget as HTMLElement).closest('.vb-chatbot__message'));
  }

  protected onMarkdownMouseLeave(): void {
    this.clearActiveCitation();
  }

  protected onSourceCiteEnter(src: VbChatbotSource, event: MouseEvent): void {
    if (!this.citationMarkersEnabled()) {
      return;
    }
    const indexes = this.sourceCiteIndexes(src);
    if (!indexes.length) {
      return;
    }
    this.setActiveCitation(
      String(indexes[0]),
      (event.currentTarget as HTMLElement).closest('.vb-chatbot__message'),
    );
  }

  protected onSourceCiteLeave(): void {
    this.clearActiveCitation();
  }

  private resolveCiteId(citeEl: HTMLElement | null): string | null {
    if (!citeEl) {
      return null;
    }
    const fromAttr = citeEl.getAttribute('data-cite');
    if (fromAttr && /^\d+$/.test(fromAttr)) {
      return fromAttr;
    }
    const fromClass = citeEl.className.match(/(?:^|\s)vb-chatbot__cite-n-(\d+)(?:\s|$)/);
    if (fromClass?.[1]) {
      return fromClass[1];
    }
    const fromText = citeEl.textContent?.match(/\[(\d+)\]/);
    return fromText?.[1] ?? null;
  }

  private setActiveCitation(cite: string, messageRoot: Element | null): void {
    this.clearCiteRefActiveClasses();
    this.activeCitation.set(cite);
    const scope = messageRoot ?? this.host.nativeElement;
    scope
      .querySelectorAll(`.vb-chatbot__cite-ref[data-cite="${cite}"], .vb-chatbot__cite-n-${cite}`)
      .forEach((el: Element) => el.classList.add('vb-chatbot__cite-ref--active'));
  }

  private clearActiveCitation(): void {
    this.clearCiteRefActiveClasses();
    this.activeCitation.set(null);
  }

  private clearCiteRefActiveClasses(): void {
    this.host.nativeElement
      .querySelectorAll('.vb-chatbot__cite-ref--active')
      .forEach((el: Element) => el.classList.remove('vb-chatbot__cite-ref--active'));
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
    let raw = vbChatbotMarkdownToHtml(text);
    if (this.citationMarkersEnabled()) {
      raw = vbChatbotWrapCitationMarkers(raw);
    }
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
