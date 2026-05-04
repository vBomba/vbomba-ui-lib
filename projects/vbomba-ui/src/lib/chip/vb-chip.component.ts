import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'vb-chip',
  standalone: true,
  templateUrl: './vb-chip.component.html',
  styleUrl: './vb-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vb-chip-host',
    '[class.vb-chip-host--disabled]': 'disabled()',
  },
})
export class VbChipComponent {
  /** When set, used as the visible label; otherwise use projected content. */
  readonly label = input<string>('');
  /** Show a close control; emits `remove` when activated. */
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the remove control (defaults to “Remove” + label when possible). */
  readonly removeAriaLabel = input<string>('');

  readonly remove = output<void>();

  protected removeButtonLabel(): string {
    const custom = this.removeAriaLabel();
    if (custom) {
      return custom;
    }
    const text = this.label();
    return text ? `Remove ${text}` : 'Remove';
  }

  protected onRemoveClick(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.remove.emit();
  }
}
