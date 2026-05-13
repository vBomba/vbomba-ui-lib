import { Injectable, signal } from '@angular/core';
import type { VbToast, VbToastShowInput } from './vb-toast.model';

@Injectable({ providedIn: 'root' })
export class VbToastStackService {
  private readonly _items = signal<VbToast[]>([]);
  /** Newest first (top of the stack). */
  readonly items = this._items.asReadonly();

  private readonly endTimes = new Map<string, number>();
  private readonly timeoutIds = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pausedIds = signal<ReadonlySet<string>>(new Set());

  /** Whether hover pause is active for a toast (drives timer bar + timeout). */
  isPaused(id: string): boolean {
    return this.pausedIds().has(id);
  }

  /**
   * Enqueue a toast. Returns the id (generated unless `input.id` is set).
   * Default duration: 5.2s.
   */
  show(input: VbToastShowInput): string {
    const id =
      input.id ??
      (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : `vb-toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    const durationMs = input.durationMs ?? 5200;
    const toast: VbToast = {
      id,
      tone: input.tone,
      title: input.title,
      message: input.message,
      durationMs,
    };
    this._items.update((list) => [toast, ...list]);
    this.endTimes.set(id, Date.now() + durationMs);
    this.schedule(id);
    return id;
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    this.endTimes.delete(id);
    this.pausedIds.update((s) => {
      if (!s.has(id)) {
        return s;
      }
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    this._items.update((list) => list.filter((t) => t.id !== id));
  }

  /** Pause auto-dismiss and the shrink timer bar (call on pointer enter). */
  pause(id: string): void {
    if (!this._items().some((t) => t.id === id)) {
      return;
    }
    this.clearTimer(id);
    this.pausedIds.update((s) => new Set(s).add(id));
  }

  /** Resume after `pause` (pointer leave). */
  resume(id: string): void {
    if (!this.pausedIds().has(id)) {
      return;
    }
    this.pausedIds.update((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    this.schedule(id);
  }

  private schedule(id: string): void {
    this.clearTimer(id);
    const end = this.endTimes.get(id);
    if (end == null) {
      return;
    }
    const remaining = Math.max(0, end - Date.now());
    if (remaining === 0) {
      this.dismiss(id);
      return;
    }
    const tid = setTimeout(() => this.dismiss(id), remaining);
    this.timeoutIds.set(id, tid);
  }

  private clearTimer(id: string): void {
    const tid = this.timeoutIds.get(id);
    if (tid != null) {
      clearTimeout(tid);
      this.timeoutIds.delete(id);
    }
  }
}
