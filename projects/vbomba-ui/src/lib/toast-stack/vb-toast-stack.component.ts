import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { VbToastStackService } from './vb-toast-stack.service';

export type VbToastStackPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'vb-toast-stack',
  standalone: true,
  templateUrl: './vb-toast-stack.component.html',
  styleUrl: './vb-toast-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbToastStackComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly stack = inject(VbToastStackService);

  /** Fixed corner for the stack. */
  readonly position = input<VbToastStackPosition>('top-right');

  /** Accessible name for the toast region. */
  readonly regionAriaLabel = input('Notifications');

  /**
   * Extra offset from the viewport top for `top-*` positions (clears fixed/sticky app bars).
   * Defaults to ~56px for `vb-app-shell`-style toolbars; use `0` if your app has no top bar.
   */
  readonly insetTopClearance = input('56px');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const el = this.host.nativeElement;
      if (el.parentElement !== this.doc.body) {
        this.doc.body.appendChild(el);
      }
    });
  }

  protected zBase(toastIndex: number, total: number): number {
    return 100 + (total - toastIndex);
  }

  protected onDismiss(id: string, ev: Event): void {
    ev.stopPropagation();
    this.stack.dismiss(id);
  }
}
