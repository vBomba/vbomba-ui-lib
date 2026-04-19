import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'vb-textarea',
  standalone: true,
  templateUrl: './vb-textarea.component.html',
  styleUrl: './vb-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.vb-textarea--mono]': 'mono()',
  },
})
export class VbTextareaComponent {
  /** Two-way bound text value. */
  readonly value = model<string>('');

  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly isReadonly = input(false, { transform: booleanAttribute });
  readonly rows = input<number>(4);
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Monospace styling (metadata / JSON style). */
  readonly mono = input(false, { transform: booleanAttribute });

  protected onInput(raw: Event): void {
    const v = (raw.target as HTMLTextAreaElement).value;
    this.value.set(v);
  }
}
