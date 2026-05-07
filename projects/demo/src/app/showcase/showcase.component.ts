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
  protected readonly chatbotMessages = signal<VbChatbotMessage[]>([
    { role: 'assistant', text: 'Hi! Ask me anything about your deployment.' },
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

    setTimeout(() => {
      this.chatbotMessages.update((items) => [
        ...items,
        { role: 'assistant', text: `Received: "${message}". Demo bot response completed.` },
      ]);
      this.chatbotLoading.set(false);
    }, 850);
  }
}
