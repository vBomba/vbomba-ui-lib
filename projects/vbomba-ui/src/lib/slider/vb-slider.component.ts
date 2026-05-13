import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

import {
  type VbSliderScale,
  VB_SLIDER_INTERNAL_STEPS,
  internalPositionToValue,
  roundToDecimals,
  valueToInternalPosition,
} from './vb-slider-math';

export type { VbSliderScale };

let vbSliderNextDomId = 0;

/**
 * Range control: `scale="linear"` | `scale="exponential"`, thin filled track, no custom hover
 * appearance (no :hover / :focus-within styling). Optional compact number field.
 */
@Component({
  selector: 'vb-slider',
  standalone: true,
  templateUrl: './vb-slider.component.html',
  styleUrl: './vb-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbSliderComponent {
  readonly value = model(0);

  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly scale = input<VbSliderScale>('linear');
  readonly exponentialCurvature = input(4, { transform: numberAttribute });
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showValue = input(true, { transform: booleanAttribute });
  readonly valueInput = input(false, { transform: booleanAttribute });
  readonly valueInputId = input<string | undefined>(undefined);
  readonly valueInputAriaLabel = input<string | undefined>(undefined, { alias: 'value-input-aria-label' });
  readonly valueDecimals = input(0, { transform: numberAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly fallbackDomId = `vb-slider-${++vbSliderNextDomId}`;

  protected readonly effectiveId = computed(() => this.id() ?? this.fallbackDomId);

  protected readonly valueInputEffectiveId = computed(
    () => this.valueInputId() ?? `${this.effectiveId()}-value`,
  );

  protected readonly internalMax = VB_SLIDER_INTERNAL_STEPS;

  protected readonly internalPosition = computed(() =>
    valueToInternalPosition(
      this.value(),
      this.min(),
      this.max(),
      this.scale(),
      this.exponentialCurvature(),
    ),
  );

  protected readonly fillPct = computed(() => (this.internalPosition() / VB_SLIDER_INTERNAL_STEPS) * 100);

  protected readonly formattedValue = computed(() => {
    const v = roundToDecimals(this.value(), this.valueDecimals());
    return this.valueDecimals() > 0 ? String(v) : String(Math.round(v));
  });

  protected readonly ariaValueText = computed(() => {
    const min = this.min();
    const max = this.max();
    const kind = this.scale() === 'exponential' ? 'exponential scale' : 'linear scale';
    return `${this.formattedValue()}, ${kind}, between ${min} and ${max}`;
  });

  protected readonly valueInputStep = computed(() => {
    const d = this.valueDecimals();
    return d <= 0 ? 1 : 1 / 10 ** d;
  });

  protected onRangeInput(event: Event): void {
    if (this.disabled()) {
      return;
    }
    const el = event.target as HTMLInputElement;
    const pos = el.valueAsNumber;
    const next = internalPositionToValue(
      pos,
      this.min(),
      this.max(),
      this.scale(),
      this.exponentialCurvature(),
      this.valueDecimals(),
    );
    this.value.set(next);
  }

  protected onValueInputField(event: Event): void {
    if (this.disabled()) {
      return;
    }
    const el = event.target as HTMLInputElement;
    const raw = el.value.trim();
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      return;
    }
    const n = el.valueAsNumber;
    if (Number.isNaN(n)) {
      return;
    }
    const min = this.min();
    const max = this.max();
    const next = roundToDecimals(max > min ? Math.min(max, Math.max(min, n)) : min, this.valueDecimals());
    this.value.set(next);
  }
}
