import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="about">
      <h1>About</h1>
      <p>
        Demo shell uses <code>vb-app-shell</code>: header with menu toggle, title, and theme control; animated
        sidenav; main content with route enter animation.
      </p>
    </div>
  `,
  styles: `
    .about {
      max-width: 42rem;
    }
    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
      font-weight: 600;
    }
    p {
      margin: 0;
      line-height: 1.55;
      color: var(--vb-color-text-muted);
    }
    code {
      font-size: 0.9em;
      padding: 0.1em 0.35em;
      border-radius: 4px;
      background: var(--vb-color-surface-muted);
      color: var(--vb-color-text-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
