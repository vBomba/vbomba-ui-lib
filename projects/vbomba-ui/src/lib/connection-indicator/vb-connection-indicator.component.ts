import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

export type VbConnectionStatus = 'connected' | 'disconnected' | 'loading';

@Component({
  selector: 'vb-connection-indicator',
  standalone: true,
  templateUrl: './vb-connection-indicator.component.html',
  styleUrl: './vb-connection-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vb-connection-indicator',
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'statusAriaLabel()',
    '[class.vb-connection-indicator--connected]': 'status() === "connected"',
    '[class.vb-connection-indicator--disconnected]': 'status() === "disconnected"',
    '[class.vb-connection-indicator--loading]': 'status() === "loading"',
    '[style.--vb-connection-dot-size.px]': 'size()',
  },
})
export class VbConnectionIndicatorComponent {
  /** `connected` — green glow; `disconnected` — red; `loading` — pulsing amber. */
  readonly status = input<VbConnectionStatus>('disconnected');
  /** Dot diameter in px. */
  readonly size = input(10, { transform: numberAttribute });
  /** Screen reader label; when empty, derived from `status()`. */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  protected statusAriaLabel(): string {
    const custom = this.ariaLabel();
    if (custom) {
      return custom;
    }
    switch (this.status()) {
      case 'connected':
        return 'Connected';
      case 'loading':
        return 'Connecting';
      default:
        return 'Disconnected';
    }
  }
}
