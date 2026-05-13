import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

export type VbAlertTone = 'neutral' | 'info' | 'success' | 'warn' | 'error';

@Component({
  selector: 'vb-alert',
  standalone: true,
  templateUrl: './vb-alert.component.html',
  styleUrl: './vb-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbAlertComponent {
  /** Visual emphasis and default ARIA role (see template). */
  readonly tone = input<VbAlertTone>('neutral');
  readonly title = input<string>('');
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Accessible name for the dismiss control. */
  readonly dismissAriaLabel = input('Dismiss');

  readonly dismiss = output<void>();

  protected alertRole(): 'alert' | 'status' {
    return this.tone() === 'error' ? 'alert' : 'status';
  }

  protected onDismissClick(): void {
    this.dismiss.emit();
  }
}
