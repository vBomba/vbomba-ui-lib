import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type VbButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'icon';

@Component({
  selector: 'vb-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './vb-button.component.html',
  styleUrl: './vb-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbButtonComponent {
  readonly variant = input<VbButtonVariant>('filled');
  readonly color = input<'primary' | 'accent' | 'warn' | undefined>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Visible text inside the button. When empty, use projected content instead. */
  readonly label = input<string>('');
  /**
   * Boxicons classes (e.g. `bx bx-save`) shown inside the button.
   * For `variant="icon"` use this or project content; set `ariaLabel` when there is no visible text.
   */
  readonly iconClass = input<string>('');
  /** Where `iconClass` appears relative to the label or projected content. */
  readonly iconPosition = input<'start' | 'end'>('start');
  /** Accessible name for `variant="icon"` (and optional override for icon + label). */
  readonly ariaLabel = input<string>('');
}
