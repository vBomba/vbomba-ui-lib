import type { VbAlertTone } from '../alert/vb-alert.component';

/** One transient toast shown in `vb-toast-stack`. */
export interface VbToast {
  id: string;
  tone: VbAlertTone;
  title?: string;
  message: string;
  durationMs: number;
}

export type VbToastShowInput = Omit<VbToast, 'id' | 'durationMs'> &
  Partial<Pick<VbToast, 'id' | 'durationMs'>>;
