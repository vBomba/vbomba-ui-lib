import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { VbThemeService } from './vb-theme.service';

/** Theme toggle: Material icon button + Boxicons (bx bx-moon / bx bx-sun), same idea as ecolabel-apps. */
@Component({
  selector: 'vb-theme-toggle',
  standalone: true,
  imports: [MatIconButton, MatTooltip],
  template: `
    <button
      matIconButton
      type="button"
      (click)="theme.toggleTheme()"
      [matTooltip]="theme.theme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
      [attr.aria-label]="theme.theme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
    >
      <i [class]="'vb-theme-toggle__icon ' + iconClass()" aria-hidden="true"></i>
    </button>
  `,
  styles: [
    `
      .vb-theme-toggle__icon {
        font-size: 22px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-style: normal;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbThemeToggleComponent {
  protected readonly theme = inject(VbThemeService);
  protected readonly iconClass = computed(() =>
    this.theme.theme() === 'light' ? 'bx bx-moon' : 'bx bx-sun',
  );
}
