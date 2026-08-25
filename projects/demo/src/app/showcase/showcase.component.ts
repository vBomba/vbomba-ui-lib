import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import {
  VbAlertComponent,
  VbButtonComponent,
  VbCardComponent,
  VbChatbotComponent,
  VbCheckboxComponent,
  VbChipComponent,
  VbConnectionIndicatorComponent,
  VbEmptyStateComponent,
  VbHintComponent,
  VbInputComponent,
  VbLoaderComponent,
  VbPaginatorComponent,
  VbPopupComponent,
  VbRadioGroupComponent,
  VbSelectComponent,
  VbSliderComponent,
  VbSimpleTableComponent,
  VbTabsComponent,
  VbTextLoaderComponent,
  VbTextareaComponent,
  VbToastStackComponent,
  VbToastStackService,
  VbToggleComponent,
  VbTreePagePickerComponent,
  type VbTabItem,
  type VbChatbotComposerAttachment,
  type VbChatbotHeaderStatus,
  type VbChatbotMessage,
  type VbChatbotMessageFeedbackEvent,
  type VbChatbotSendEvent,
  type VbChatbotSourceOption,
  type VbConnectionStatus,
  type VbRadioOption,
  type VbSelectOption,
  type VbSimpleTableColumn,
  type VbTreePageNode,
} from 'vbomba-ui';

function flattenTreePageLeaves(nodes: VbTreePageNode[]): VbChatbotSourceOption[] {
  const out: VbChatbotSourceOption[] = [];
  const walk = (list: VbTreePageNode[]): void => {
    for (const node of list) {
      if (node.children?.length) {
        walk(node.children);
        continue;
      }
      out.push({
        value: node.id,
        label: node.label,
        description: node.description,
        disabled: node.disabled,
      });
    }
  };
  walk(nodes);
  return out;
}

interface ShowcaseChatConversation {
  id: string;
  label: string;
  messages: VbChatbotMessage[];
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    VbAlertComponent,
    VbButtonComponent,
    VbCardComponent,
    VbChatbotComponent,
    VbCheckboxComponent,
    VbChipComponent,
    VbConnectionIndicatorComponent,
    VbEmptyStateComponent,
    VbHintComponent,
    VbInputComponent,
    VbLoaderComponent,
    VbPaginatorComponent,
    VbPopupComponent,
    VbRadioGroupComponent,
    VbSelectComponent,
    VbSliderComponent,
    VbSimpleTableComponent,
    VbTabsComponent,
    VbTextLoaderComponent,
    VbTextareaComponent,
    VbToastStackComponent,
    VbToggleComponent,
    VbTreePagePickerComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseComponent {
  private readonly toastStack = inject(VbToastStackService);

  protected readonly popupOpen = model(false);
  protected readonly paginatorPage = model(2);
  protected readonly tablePage = model(1);
  protected readonly notificationsEnabled = model(true);
  protected readonly betaEnabled = model(false);
  protected readonly wifiEnabled = model(true);
  protected readonly autoSaveDrafts = model(false);
  protected readonly displayName = model<string>('Ada Lovelace');
  protected readonly teamRole = model<string>('eng');
  protected readonly deployEnv = model<string>('dev');
  protected readonly draftNotes = model<string>('');

  protected readonly sliderLinear = model(42);
  protected readonly sliderExponential = model(120);

  protected readonly demoTags = signal<string[]>(['Angular', 'Material', 'Standalone']);
  protected readonly demoTabItems = signal<VbTabItem[]>([
    { value: 'overview', label: 'Overview', iconClass: 'bx bx-grid-alt' },
    { value: 'metrics', label: 'Metrics', iconClass: 'bx bx-line-chart' },
    { value: 'settings', label: 'Settings', iconClass: 'bx bx-cog' },
    { value: 'archived', label: 'Archived', iconClass: 'bx bx-archive', disabled: true },
  ]);
  protected readonly demoTabsValue = model('overview');
  protected readonly demoCardTabsValue = model('overview');
  protected readonly demoStickyTabsEnabled = model(true);
  protected readonly demoBillingPlan = model<string | null>('monthly');
  protected readonly demoBillingRadioOptions = signal<VbRadioOption[]>([
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly (save ~15%)' },
    { value: 'enterprise', label: 'Enterprise (contact sales)', disabled: true },
  ]);
  protected readonly demoAlertPromoDismissed = signal(false);
  protected readonly demoHintExpanded = model(false);
  protected readonly demoHintProjectedExpanded = model(true);
  protected readonly demoConnectionStatus = signal<VbConnectionStatus>('loading');
  protected readonly demoDensity = model<string | null>('cozy');
  protected readonly demoDensityRadioOptions = signal<VbRadioOption[]>([
    { value: 'compact', label: 'Compact' },
    { value: 'cozy', label: 'Cozy' },
    { value: 'spacious', label: 'Spacious' },
  ]);
  protected readonly textLoaderRestartKey = signal(0);
  protected readonly chatbotLoading = signal(false);
  protected readonly chatbotHeaderStatus = signal<VbChatbotHeaderStatus | null>({
    label: 'Ready',
    tone: 'idle',
  });
  protected readonly chatbotConversationId = model('deploy');
  private readonly chatbotThreads = signal<ShowcaseChatConversation[]>([
    {
      id: 'deploy',
      label: 'Deployment status',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          text: 'Hi! Ask me anything about your deployment.\n\nSee [1] for the framework overview and [2] for forms guidance. Try **markdown**, hover citations, `copy`, and scroll when the thread grows.',
          sources: [
            {
              href: 'https://angular.dev/overview',
              pageTitle: '[1] Angular docs — Overview',
              chunkType: 'heading',
              citeIndex: 1,
              score: 0.912,
              fragments: [
                { label: 'Heading', score: 0.912 },
                { label: 'Paragraph', score: 0.841 },
              ],
            },
            {
              href: 'https://angular.dev/guide/forms',
              pageTitle: '[2] Reactive forms',
              chunkType: 'paragraph',
              citeIndex: 2,
              score: 0.873,
              fragments: [
                { label: 'Paragraph', score: 0.873 },
                { label: 'Code', score: 0.704 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tokens',
      label: 'Theme tokens',
      messages: [
        {
          id: 'tokens-welcome',
          role: 'assistant',
          text: 'This is a second conversation. Switch threads with the header select, or start a new one with **+**.',
        },
      ],
    },
  ]);

  protected readonly chatbotConversationOptions = computed<VbSelectOption[]>(() =>
    this.chatbotThreads().map((thread) => ({ value: thread.id, label: thread.label })),
  );

  protected readonly chatbotMessages = computed(
    () =>
      this.chatbotThreads().find((thread) => thread.id === this.chatbotConversationId())
        ?.messages ?? [],
  );

  protected readonly demoPageTree = signal<VbTreePageNode[]>([
    {
      id: 'docs',
      label: 'Documentation',
      children: [
        {
          id: 'framework',
          label: 'Framework',
          children: [
            {
              id: 'angular-docs',
              label: 'Angular docs',
              description: 'Official Angular documentation',
            },
            {
              id: 'angular-cli',
              label: 'Angular CLI',
              description: 'Workspace and schematics reference',
            },
          ],
        },
        {
          id: 'design',
          label: 'Design system',
          children: [
            {
              id: 'design-tokens',
              label: 'Design tokens',
              description: 'vbomba-ui color and radius tokens',
            },
            {
              id: 'spacing',
              label: 'Spacing scale',
              description: 'Layout rhythm and density',
              children: [
                {
                  id: 'spacing-compact',
                  label: 'Compact',
                  description: 'Dense UI density preset',
                },
                {
                  id: 'spacing-comfortable',
                  label: 'Comfortable',
                  description: 'Default density preset',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ops',
      label: 'Operations',
      children: [
        {
          id: 'runbooks',
          label: 'Ops runbooks',
          description: 'Internal deployment and incident playbooks',
        },
        {
          id: 'archived-wiki',
          label: 'Archived wiki',
          description: 'Read-only legacy pages',
          disabled: true,
        },
      ],
    },
  ]);

  protected readonly demoTreePageId = model<string | null>('design-tokens');
  protected readonly chatbotAttachments = model<VbChatbotComposerAttachment[]>([]);
  protected readonly chatbotSourceOptions = computed(() => flattenTreePageLeaves(this.demoPageTree()));
  protected readonly chatbotRoleOption: VbChatbotSourceOption = {
    value: 'ops-lead',
    label: 'Ops lead',
    description: 'Deployment and incident response persona',
  };

  private updateActiveChatMessages(
    updater: (messages: VbChatbotMessage[]) => VbChatbotMessage[],
  ): void {
    const activeId = this.chatbotConversationId();
    this.chatbotThreads.update((threads) =>
      threads.map((thread) =>
        thread.id === activeId ? { ...thread, messages: updater(thread.messages) } : thread,
      ),
    );
  }
  protected readonly roleOptions = signal<VbSelectOption[]>([
    { value: 'eng', label: 'Engineer' },
    { value: 'design', label: 'Designer' },
    { value: 'pm', label: 'Product' },
  ]);

  protected readonly envOptions = signal<VbSelectOption[]>([
    { value: 'dev', label: 'Development' },
    { value: 'stage', label: 'Staging' },
    { value: 'prod', label: 'Production' },
  ]);

  protected readonly jsonSample = '{\n  "example": true\n}';

  protected readonly tableColumns = signal<VbSimpleTableColumn[]>([
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ]);

  protected readonly tableRows = signal<Record<string, unknown>[]>([
    { name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
    { name: 'Grace Hopper', role: 'Engineer', status: 'Away' },
    { name: 'Margaret Hamilton', role: 'Lead', status: 'Active' },
    { name: 'Katherine Johnson', role: 'Analyst', status: 'Active' },
    { name: 'Radia Perlman', role: 'Architect', status: 'Active' },
    { name: 'Hedy Lamarr', role: 'Inventor', status: 'Away' },
    { name: 'Annie Easley', role: 'Engineer', status: 'Active' },
  ]);

  protected removeDemoTag(tag: string): void {
    this.demoTags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected toastDemoInfo(): void {
    this.toastStack.show({
      tone: 'info',
      title: 'Deploy queued',
      message:
        'Toasts overlap; hover to expand, read fully, and pause the timer bar. Move the pointer away to resume.',
      durationMs: 9000,
    });
  }

  protected toastDemoSuccess(): void {
    this.toastStack.show({
      tone: 'success',
      title: 'Build passed',
      message: 'Smoke tests finished without failures.',
      durationMs: 6500,
    });
  }

  protected toastDemoBurst(): void {
    this.toastDemoInfo();
    window.setTimeout(() => this.toastDemoSuccess(), 140);
    window.setTimeout(
      () =>
        this.toastStack.show({
          tone: 'warn',
          title: 'Rate limit',
          message: 'You are close to the hourly API quota.',
          durationMs: 8000,
        }),
      280,
    );
  }

  protected setDemoConnection(status: VbConnectionStatus): void {
    this.demoConnectionStatus.set(status);
  }

  protected restartTextLoaders(): void {
    this.textLoaderRestartKey.update((value) => value + 1);
  }

  protected onChatbotSend(event: VbChatbotSendEvent): void {
    this.updateActiveChatMessages((items) => [
      ...items,
      {
        role: 'user',
        text: event.text,
        attachments: event.attachments.length ? [...event.attachments] : undefined,
      },
    ]);
    this.chatbotLoading.set(true);
    this.chatbotHeaderStatus.set({ label: 'Connecting…', tone: 'busy' });

    const replyId = `stream-${Date.now()}`;
    const targetConversationId = this.chatbotConversationId();
    const startedAt = performance.now();
    const sourceNames = event.attachments
      .filter((att) => att.kind === 'source')
      .map((att) => att.label);
    const sourcesLine = sourceNames.length
      ? `\n\nUsing sources: ${sourceNames.map((n) => `**${n}**`).join(', ')}.`
      : '';
    const fullText = `Received: **${event.text}**${sourcesLine}

Long replies stream character by character. When \`streaming: false\`, markdown works:

- bullet lists
- \`inline code\`
- [Angular docs](https://angular.dev)

\`\`\`ts
provideRouter(routes);
\`\`\``;
    let charIndex = 0;

    const patchTarget = (updater: (messages: VbChatbotMessage[]) => VbChatbotMessage[]): void => {
      this.chatbotThreads.update((threads) =>
        threads.map((thread) =>
          thread.id === targetConversationId
            ? { ...thread, messages: updater(thread.messages) }
            : thread,
        ),
      );
    };

    const finishReply = () => {
      const latencySeconds = (performance.now() - startedAt) / 1000;
      patchTarget((items) =>
        items.map((m) =>
          m.id === replyId
            ? {
                ...m,
                text: fullText,
                streaming: false,
                responseLatencySeconds: latencySeconds,
                sources: [
                  {
                    href: 'https://angular.dev/guide/ssr',
                    pageTitle: 'Server-side rendering',
                    chunkType: 'section',
                  },
                  {
                    href: 'https://material.angular.dev/components/button/overview',
                    pageTitle: 'Angular Material — Buttons',
                    chunkType: 'table',
                  },
                ],
              }
            : m,
        ),
      );
      if (this.chatbotConversationId() === targetConversationId) {
        this.chatbotHeaderStatus.set({ label: 'Ready', tone: 'idle' });
        this.chatbotLoading.set(false);
      }
    };

    const appendChunk = (): void => {
      if (charIndex >= fullText.length) {
        finishReply();
        return;
      }
      // Emulate backend token streaming: irregular chunk sizes and cadence.
      const nextChunkSize = Math.min(fullText.length - charIndex, Math.floor(Math.random() * 3) + 1);
      const chunk = fullText.slice(charIndex, charIndex + nextChunkSize);
      charIndex += nextChunkSize;
      patchTarget((items) =>
        items.map((m) => (m.id === replyId ? { ...m, text: `${m.text}${chunk}`, streaming: true } : m)),
      );
      const nextDelayMs = 18 + Math.floor(Math.random() * 55);
      window.setTimeout(appendChunk, nextDelayMs);
    };

    window.setTimeout(() => {
      if (this.chatbotConversationId() === targetConversationId) {
        this.chatbotLoading.set(false);
        this.chatbotHeaderStatus.set({ label: 'Streaming reply…', tone: 'streaming' });
      }
      patchTarget((items) => [
        ...items,
        { id: replyId, role: 'assistant', text: '', streaming: true },
      ]);
      appendChunk();
    }, 380);
  }

  protected onChatbotClearHistory(): void {
    this.updateActiveChatMessages(() => []);
    this.chatbotLoading.set(false);
    this.chatbotHeaderStatus.set({ label: 'Ready', tone: 'idle' });
  }

  protected onChatbotNewConversation(): void {
    const id = `chat-${Date.now()}`;
    const index = this.chatbotThreads().length + 1;
    this.chatbotThreads.update((threads) => [
      ...threads,
      {
        id,
        label: `Conversation ${index}`,
        messages: [
          {
            id: `${id}-welcome`,
            role: 'assistant',
            text: 'New conversation started. Ask anything.',
          },
        ],
      },
    ]);
    this.chatbotConversationId.set(id);
    this.chatbotLoading.set(false);
    this.chatbotHeaderStatus.set({ label: 'Ready', tone: 'idle' });
  }

  protected onChatbotMessageFeedback(event: VbChatbotMessageFeedbackEvent): void {
    this.updateActiveChatMessages((items) =>
      items.map((m, i) => {
        const key = m.id ?? String(i);
        if (key !== event.messageId) {
          return m;
        }
        return {
          ...m,
          feedback: event.feedback,
          feedbackComment:
            event.feedback === 'dislike' ? (event.feedbackComment ?? null) : null,
        };
      }),
    );
  }
}
