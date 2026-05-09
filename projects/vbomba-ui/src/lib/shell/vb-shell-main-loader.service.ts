import { Injectable, computed, signal } from '@angular/core';
import { VbShellMainLoader } from './vb-shell-main-loader';

@Injectable({ providedIn: 'root' })
export class VbShellMainLoaderService {
  private readonly overrideState = signal<Partial<VbShellMainLoader> | null>(null);

  /** Read-only override state used by `VbAppShellComponent`. */
  readonly override = computed(() => this.overrideState());

  /** Replace the override object entirely. Pass `null` to clear and fall back to route data. */
  set(value: Partial<VbShellMainLoader> | null): void {
    this.overrideState.set(value);
  }

  /** Merge into current override object (creates one if missing). */
  patch(value: Partial<VbShellMainLoader>): void {
    this.overrideState.update((prev) => ({ ...(prev ?? {}), ...value }));
  }

  /** Clear runtime override and let `route.data.mainLoader` drive the slot. */
  clear(): void {
    this.overrideState.set(null);
  }

  /** Convenience helper: show loader and optionally override `size` / `ariaLabel`. */
  show(config?: Omit<VbShellMainLoader, 'visible'>): void {
    this.patch({ ...(config ?? {}), visible: true });
  }

  /** Convenience helper: hide loader while keeping current route-level config intact. */
  hide(): void {
    this.patch({ visible: false });
  }
}
