export interface VbShellMainLoader {
  /** Show or hide horizontal loader while preserving reserved slot height. */
  visible?: boolean;
  /** Loader size passed to `vb-loader` (controls bar thickness/width proportion). */
  size?: number;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}
