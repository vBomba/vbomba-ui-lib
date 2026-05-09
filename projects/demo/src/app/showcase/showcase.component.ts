import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import {
  VbButtonComponent,
  VbCardComponent,
  VbChatbotComponent,
  VbCheckboxComponent,
  VbChipComponent,
  VbConnectionIndicatorComponent,
  VbInputComponent,
  VbLoaderComponent,
  VbPaginatorComponent,
  VbPopupComponent,
  VbSelectComponent,
  VbSimpleTableComponent,
  VbTextLoaderComponent,
  VbTextareaComponent,
  VbToggleComponent,
  type VbChatbotHeaderStatus,
  type VbChatbotMessage,
  type VbConnectionStatus,
  type VbSelectOption,
  type VbSimpleTableColumn,
} from 'vbomba-ui';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    VbButtonComponent,
    VbCardComponent,
    VbChatbotComponent,
    VbCheckboxComponent,
    VbChipComponent,
    VbConnectionIndicatorComponent,
    VbInputComponent,
    VbLoaderComponent,
    VbPaginatorComponent,
    VbPopupComponent,
    VbSelectComponent,
    VbSimpleTableComponent,
    VbTextLoaderComponent,
    VbTextareaComponent,
    VbToggleComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseComponent {
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

  protected readonly demoTags = signal<string[]>(['Angular', 'Material', 'Standalone']);
  protected readonly demoConnectionStatus = signal<VbConnectionStatus>('loading');
  protected readonly textLoaderRestartKey = signal(0);
  protected readonly chatbotLoading = signal(false);
  protected readonly chatbotHeaderStatus = signal<VbChatbotHeaderStatus | null>({
    label: 'Ready',
    tone: 'idle',
  });
  protected readonly chatbotMessages = signal<VbChatbotMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! Ask me anything about your deployment.',
      sources: [
        {
          href: 'https://angular.dev/overview',
          pageTitle: 'Angular docs — Overview',
          chunkType: 'heading',
        },
        {
          href: 'https://angular.dev/guide/forms',
          pageTitle: 'Reactive forms',
          chunkType: 'paragraph',
        },
      ],
    },
  ]);

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

  protected setDemoConnection(status: VbConnectionStatus): void {
    this.demoConnectionStatus.set(status);
  }

  protected restartTextLoaders(): void {
    this.textLoaderRestartKey.update((value) => value + 1);
  }

  protected onChatbotSend(message: string): void {
    this.chatbotMessages.update((items) => [...items, { role: 'user', text: message }]);
    this.chatbotLoading.set(true);
    this.chatbotHeaderStatus.set({ label: 'Connecting…', tone: 'busy' });

    const replyId = `stream-${Date.now()}`;
    const startedAt = performance.now();
    const fullText = `Received: "${message}". Long replies can stream character by character — keep streaming: true on the assistant bubble until the final chunk arrives.`;
    let charIndex = 0;

    const finishReply = () => {
      const latencySeconds = (performance.now() - startedAt) / 1000;
      this.chatbotMessages.update((items) =>
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
      this.chatbotHeaderStatus.set({ label: 'Ready', tone: 'idle' });
      this.chatbotLoading.set(false);
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
      this.chatbotMessages.update((items) =>
        items.map((m) => (m.id === replyId ? { ...m, text: `${m.text}${chunk}`, streaming: true } : m)),
      );
      const nextDelayMs = 18 + Math.floor(Math.random() * 55);
      window.setTimeout(appendChunk, nextDelayMs);
    };

    window.setTimeout(() => {
      this.chatbotLoading.set(false);
      this.chatbotHeaderStatus.set({ label: 'Streaming reply…', tone: 'streaming' });
      this.chatbotMessages.update((items) => [
        ...items,
        { id: replyId, role: 'assistant', text: '', streaming: true },
      ]);
      appendChunk();
    }, 380);
  }

  protected onChatbotClearHistory(): void {
    this.chatbotMessages.set([]);
    this.chatbotLoading.set(false);
    this.chatbotHeaderStatus.set({ label: 'Ready', tone: 'idle' });
  }
}
