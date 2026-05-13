import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import type { VbRadioOption } from './vb-radio-option';

let vbRadioGroupSeq = 0;

@Component({
  selector: 'vb-radio-group',
  standalone: true,
  templateUrl: './vb-radio-group.component.html',
  styleUrl: './vb-radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbRadioGroupComponent {
  private readonly fallbackName = `vb-radio-group-${vbRadioGroupSeq++}`;

  /** Selected option value (two-way). */
  readonly value = model<string | null>(null);

  readonly options = input<VbRadioOption[]>([]);
  /** Optional group caption (renders a `<legend>`). */
  readonly legend = input<string>('');
  /** Shared `name` for native radios; auto-generated when omitted. */
  readonly name = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * When `legend` is empty, set this for an accessible group name (native `aria-label` on the
   * `<fieldset>`).
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** `vertical` stacks options; `horizontal` wraps on one row where space allows. */
  readonly layout = input<'vertical' | 'horizontal'>('vertical');

  protected readonly resolvedName = computed(() => this.name() ?? this.fallbackName);

  protected selectOption(next: string): void {
    if (this.disabled()) {
      return;
    }
    const opt = this.options().find((o) => o.value === next);
    if (opt?.disabled) {
      return;
    }
    this.value.set(next);
  }
}
