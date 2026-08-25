import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';

/** Semantic color for the leading hint icon. */
export type VbHintIconTone = 'primary' | 'muted' | 'success' | 'warn' | 'error';

/**
 * Inline hint / tip with a Boxicons icon and an optional long description
 * that the user can open and close.
 */
@Component({
  selector: 'vb-hint',
  standalone: true,
  templateUrl: './vb-hint.component.html',
  styleUrl: './vb-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbHintComponent {
  /** Short summary shown next to the icon. */
  readonly title = input.required<string>();
  /** Long description shown when expanded. Prefer this or projected content. */
  readonly description = input<string>('');
  /** Boxicons class for the leading icon (default info circle). */
  readonly iconClass = input('bx bx-info-circle');
  /** Color of the leading icon (token-backed tones). */
  readonly iconTone = input<VbHintIconTone>('primary');
  /**
   * When true (default), the long body can be toggled.
   * When false, the body (if any) stays visible.
   */
  readonly expandable = input(true, { transform: booleanAttribute });
  /** Open/closed state of the long description (two-way bindable). */
  readonly expanded = model(false);
  readonly expandAriaLabel = input('Show hint details');
  readonly collapseAriaLabel = input('Hide hint details');

  protected readonly bodyId = `vb-hint-body-${crypto.randomUUID()}`;

  protected readonly bodyVisible = computed(
    () => !this.expandable() || this.expanded(),
  );

  protected readonly hasDescription = computed(() => this.description().trim().length > 0);

  protected toggleExpanded(): void {
    if (!this.expandable()) {
      return;
    }
    this.expanded.update((open) => !open);
  }
}
