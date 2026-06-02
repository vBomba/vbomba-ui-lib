import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { VbTabsComponent, type VbTabItem } from '../tabs/vb-tabs.component';

@Component({
  selector: 'vb-card',
  standalone: true,
  imports: [VbTabsComponent],
  templateUrl: './vb-card.component.html',
  styleUrl: './vb-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vb-card-host',
    '[class.vb-card-host--tabbed]': 'hasTabs()',
  },
})
export class VbCardComponent {
  /** When set, renders a tab row glued to the top of the card (sticky while the body scrolls). */
  readonly tabs = input<VbTabItem[]>([]);
  readonly tabValue = model<string>('');
  readonly stickyTabs = input(true, { transform: booleanAttribute });
  readonly tabsAriaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly tabsBg = input<'default' | 'muted'>('default');
  /**
   * Scrollable card body (required for in-card sticky tabs). Set a CSS length, e.g. `12rem`.
   * Ignored when `tabs` is empty.
   */
  readonly tabBodyMaxHeight = input<string | null>(null);

  protected readonly hasTabs = computed(() => this.tabs().length > 0);
  protected readonly scrollableBody = computed(
    () => this.hasTabs() && this.tabBodyMaxHeight() != null && this.tabBodyMaxHeight() !== '',
  );
}
