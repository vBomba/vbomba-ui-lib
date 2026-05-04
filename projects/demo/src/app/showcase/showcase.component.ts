import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import {
  VbButtonComponent,
  VbCheckboxComponent,
  VbChipComponent,
  VbConnectionIndicatorComponent,
  VbInputComponent,
  VbLoaderComponent,
  VbPaginatorComponent,
  VbPopupComponent,
  VbSelectComponent,
  VbSimpleTableComponent,
  VbTextareaComponent,
  VbToggleComponent,
  type VbConnectionStatus,
  type VbSelectOption,
  type VbSimpleTableColumn,
} from 'vbomba-ui';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    VbButtonComponent,
    VbCheckboxComponent,
    VbChipComponent,
    VbConnectionIndicatorComponent,
    VbInputComponent,
    VbLoaderComponent,
    VbPaginatorComponent,
    VbPopupComponent,
    VbSelectComponent,
    VbSimpleTableComponent,
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
}
