import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, input, model } from '@angular/core';
import { VbTabComponent } from './vb-tab.component';

export interface VbTabItem {
  value: string;
  label: string;
  iconClass?: string;
  disabled?: boolean;
}

@Component({
  selector: 'vb-tabs',
  standalone: true,
  templateUrl: './vb-tabs.component.html',
  styleUrl: './vb-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VbTabComponent],
})
export class VbTabsComponent {
  /**
   * Currently selected tab value (two-way).
   * Prefer passing this as `[(value)]="..."`.
   */
  readonly value = model<string>('');

  readonly tabs = input<VbTabItem[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly stickyTabsBg = input<'default' | 'muted'>('default');

  protected readonly hasTabs = computed(() => this.tabs().length > 0);

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (!tabs.length) {
        return;
      }
      if (this.value()) {
        return;
      }
      const firstEnabled = tabs.find((t) => !t.disabled) ?? tabs[0];
      if (firstEnabled && firstEnabled.value) {
        this.value.set(firstEnabled.value);
      }
    });
  }

  protected onSelect(next: string): void {
    if (this.disabled()) {
      return;
    }
    const tab = this.tabs().find((t) => t.value === next);
    if (tab?.disabled) {
      return;
    }
    this.value.set(next);
  }

  protected resolveActive(tab: VbTabItem): boolean {
    // If `value` is not initialized and tabs exist, default to the first enabled.
    if (!this.value() && this.hasTabs()) {
      const firstEnabled = this.tabs().find((t) => !t.disabled);
      if (firstEnabled) {
        return tab.value === firstEnabled.value;
      }
    }
    return this.value() === tab.value;
  }
}

