import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import {
  VbButtonComponent,
  VbLoaderComponent,
  VbPaginatorComponent,
  VbPopupComponent,
  VbSelectComponent,
  VbSimpleTableComponent,
  VbTextareaComponent,
  type VbSelectOption,
  type VbSimpleTableColumn,
} from 'vbomba-ui';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    VbButtonComponent,
    VbLoaderComponent,
    VbPaginatorComponent,
    VbPopupComponent,
    VbSelectComponent,
    VbSimpleTableComponent,
    VbTextareaComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseComponent {
  protected readonly popupOpen = model(false);
  protected readonly paginatorPage = model(2);
  protected readonly tablePage = model(1);
  protected readonly teamRole = model<string>('eng');
  protected readonly deployEnv = model<string>('dev');
  protected readonly draftNotes = model<string>('');

  protected readonly roleOptions = signal<VbSelectOption[]>([
    { value: 'eng', label: 'Engineer' },
    { value: 'design', label: 'Designer' },
    { value: 'pm', label: 'Product' },
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
}
