import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

export interface VbSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'vb-select',
  standalone: true,
  templateUrl: './vb-select.component.html',
  styleUrl: './vb-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbSelectComponent {
  /** Two-way bound option value. */
  readonly value = model<string>('');

  /** When non-empty, options are rendered from this list; otherwise use projected `<option>` / `<optgroup>`. */
  readonly options = input<VbSelectOption[]>([]);

  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected onChange(sel: HTMLSelectElement): void {
    this.value.set(sel.value);
  }
}
