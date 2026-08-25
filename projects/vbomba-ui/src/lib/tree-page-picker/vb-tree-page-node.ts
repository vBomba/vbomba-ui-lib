/** One node in a page tree for {@link VbTreePagePickerComponent}. */
export interface VbTreePageNode {
  id: string;
  label: string;
  /** Optional longer text (tooltip / subtler row hint). */
  description?: string;
  disabled?: boolean;
  children?: VbTreePageNode[];
}

export type VbTreePageSelectionMode = 'single' | 'multiple';
