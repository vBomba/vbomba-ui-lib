import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type VbButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated';

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
}
