import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'vb-toggle',
  standalone: true,
  templateUrl: './vb-toggle.component.html',
  styleUrl: './vb-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbToggleComponent {
  readonly checked = model(false);

  readonly label = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly value = input<string>('on');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected onChange(inputEl: HTMLInputElement): void {
    this.checked.set(inputEl.checked);
  }
}
