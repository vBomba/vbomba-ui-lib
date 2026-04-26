import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

export type VbInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

function optionalNumberAttribute(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const parsed = numberAttribute(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

@Component({
  selector: 'vb-input',
  standalone: true,
  templateUrl: './vb-input.component.html',
  styleUrl: './vb-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbInputComponent {
  /** Two-way bound input value. */
  readonly value = model<string>('');

  readonly type = input<VbInputType>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly isReadonly = input(false, { transform: booleanAttribute });
  readonly counter = input(false, { transform: booleanAttribute });
  readonly maxLength = input(undefined, { transform: optionalNumberAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected readonly counterLabel = computed(() => {
    const length = this.value().length;
    const maxLength = this.maxLength();
    return maxLength === undefined ? `${length}` : `${length}/${maxLength}`;
  });

  protected onInput(raw: Event): void {
    const value = (raw.target as HTMLInputElement).value;
    this.value.set(value);
  }
}
