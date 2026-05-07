import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'vb-user-info',
  standalone: true,
  templateUrl: './vb-user-info.component.html',
  styleUrl: './vb-user-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbUserInfoComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly login = input<string>('');
  readonly username = input<string>('');
  readonly avatarUrl = input<string>('');
  /** Total session length in seconds used to render ring progress. */
  readonly sessionDurationSeconds = input(0);
  /** Initial remaining seconds; when omitted falls back to `sessionDurationSeconds`. */
  readonly initialRemainingSeconds = input<number | null>(null);

  protected readonly remainingSeconds = signal(0);
  protected readonly displayName = computed(() => this.username() || this.login() || 'Guest');
  protected readonly avatarInitials = computed(() => {
    const source = this.displayName().trim();
    if (!source) {
      return '?';
    }
    const parts = source.split(/\s+/).slice(0, 2);
    return parts
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);
  });

  protected readonly progress = computed(() => {
    const total = Math.max(this.sessionDurationSeconds(), 0);
    if (total === 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, this.remainingSeconds() / total));
  });

  protected readonly progressDegrees = computed(() => `${Math.round(this.progress() * 360)}deg`);
  protected readonly countdown = computed(() => this.formatTime(this.remainingSeconds()));

  constructor() {
    effect((onCleanup) => {
      const total = Math.max(this.sessionDurationSeconds(), 0);
      const initial = this.initialRemainingSeconds();
      const start = Math.max(0, Math.min(initial ?? total, total));

      this.remainingSeconds.set(start);
      if (start <= 0) {
        return;
      }

      const timer = setInterval(() => {
        this.remainingSeconds.update((value) => {
          if (value <= 1) {
            clearInterval(timer);
            return 0;
          }
          return value - 1;
        });
      }, 1000);

      onCleanup(() => clearInterval(timer));
    });

    this.destroyRef.onDestroy(() => {
      this.remainingSeconds.set(0);
    });
  }

  private formatTime(totalSeconds: number): string {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (safe % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
