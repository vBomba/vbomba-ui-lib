import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'vb-text-loader',
  standalone: true,
  templateUrl: './vb-text-loader.component.html',
  styleUrl: './vb-text-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'ariaLabel() || text()',
  },
})
export class VbTextLoaderComponent {
  private readonly destroyRef = inject(DestroyRef);

  /** Text prefix shown before animated dots, e.g. "Generating answer". */
  readonly text = input('Loading');
  /** Enable/disable per-character typing animation. */
  readonly animateText = input(true, { transform: booleanAttribute });
  /** Show/hide trailing animated dots. */
  readonly showDots = input(true, { transform: booleanAttribute });
  /** Typing speed in milliseconds per character. */
  readonly typingSpeedMs = input(32);
  /** Change value to restart typing from zero. */
  readonly restartKey = input(0);
  /** Optional screen-reader label override. */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  protected readonly renderedText = signal('');

  constructor() {
    effect((onCleanup) => {
      const fullText = this.text();
      const animated = this.animateText();
      const speed = Math.max(12, this.typingSpeedMs());
      this.restartKey();

      let index = 0;
      if (!animated) {
        this.renderedText.set(fullText);
        return;
      }

      this.renderedText.set('');
      if (!fullText) {
        return;
      }

      const timer = setInterval(() => {
        index += 1;
        this.renderedText.set(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(timer);
        }
      }, speed);

      onCleanup(() => clearInterval(timer));
    });

    this.destroyRef.onDestroy(() => {
      this.renderedText.set('');
    });
  }
}
