import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vb-empty-state',
  standalone: true,
  templateUrl: './vb-empty-state.component.html',
  styleUrl: './vb-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  /** Optional Boxicons class (e.g. `bx bx-folder-open`). */
  readonly iconClass = input<string>('');
}
