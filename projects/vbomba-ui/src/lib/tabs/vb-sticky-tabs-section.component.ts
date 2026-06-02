import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { VbTabsComponent, type VbTabItem } from './vb-tabs.component';

@Component({
  selector: 'vb-sticky-tabs-section',
  standalone: true,
  templateUrl: './vb-sticky-tabs-section.component.html',
  styleUrl: './vb-sticky-tabs-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VbTabsComponent],
})
export class VbStickyTabsSectionComponent {
  readonly value = model<string>('');

  readonly tabs = input<VbTabItem[]>([]);
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly stickyTop = input(0, { transform: Number });

  /**
   * Background of the sticky header; choose `muted` when you want a stronger separation.
   * Kept in sync with `vb-tabs` styling.
   */
  readonly stickyTabsBg = input<'default' | 'muted'>('default');
}

