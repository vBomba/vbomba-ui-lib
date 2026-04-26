import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
  output,
} from '@angular/core';

let nextPopupId = 0;

@Component({
  selector: 'vb-popup',
  standalone: true,
  templateUrl: './vb-popup.component.html',
  styleUrl: './vb-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbPopupComponent {
  readonly open = model(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly closeAriaLabel = input('Close popup', { alias: 'close-aria-label' });
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });

  readonly closed = output<void>();

  protected readonly titleId = `vb-popup-title-${nextPopupId++}`;

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}
