import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'vbomba-ui-theme';

export type VbThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class VbThemeService {
  private readonly stored = signal<VbThemeMode | null>(this.readStored());
  readonly theme = computed(() => this.stored() ?? 'light');

  setTheme(mode: VbThemeMode): void {
    this.stored.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / private mode */
    }
    this.applyToDocument(mode);
  }

  toggleTheme(): void {
    const next: VbThemeMode = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  /** Call once on app init to apply stored preference */
  init(): void {
    this.applyToDocument(this.theme());
  }

  private readStored(): VbThemeMode | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch {
      /* ignore */
    }
    return null;
  }

  private applyToDocument(mode: VbThemeMode): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    document.body.classList.toggle('app-dark-theme', mode === 'dark');
    document.body.classList.toggle('app-light-theme', mode === 'light');
  }
}
