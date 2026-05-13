/** Internal linear thumb position 0…STEPS mapped to real `min`…`max` per scale mode. */
export const VB_SLIDER_INTERNAL_STEPS = 10_000;

export type VbSliderScale = 'linear' | 'exponential';

export function clamp01(t: number): number {
  if (Number.isNaN(t)) {
    return 0;
  }
  return Math.min(1, Math.max(0, t));
}

export function linearTToValue(t: number, min: number, max: number): number {
  if (max <= min) {
    return min;
  }
  return min + clamp01(t) * (max - min);
}

export function linearValueToT(value: number, min: number, max: number): number {
  if (max <= min) {
    return 0;
  }
  return clamp01((value - min) / (max - min));
}

export function exponentialTToValue(t: number, min: number, max: number, k: number): number {
  if (max <= min) {
    return min;
  }
  const tt = clamp01(t);
  if (k <= 1e-6) {
    return linearTToValue(tt, min, max);
  }
  const ek = Math.exp(k);
  return min + ((max - min) * (Math.exp(k * tt) - 1)) / (ek - 1);
}

export function exponentialValueToT(value: number, min: number, max: number, k: number): number {
  if (max <= min) {
    return 0;
  }
  const ratio = clamp01((value - min) / (max - min));
  if (k <= 1e-6) {
    return ratio;
  }
  const ek = Math.exp(k);
  return Math.log(ratio * (ek - 1) + 1) / k;
}

export function roundToDecimals(value: number, decimals: number): number {
  if (decimals <= 0) {
    return Math.round(value);
  }
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function valueToInternalPosition(
  value: number,
  min: number,
  max: number,
  scale: VbSliderScale,
  curvature: number,
): number {
  const bounded = max > min ? Math.min(max, Math.max(min, value)) : min;
  const t =
    scale === 'exponential'
      ? exponentialValueToT(bounded, min, max, curvature)
      : linearValueToT(bounded, min, max);
  return Math.round(clamp01(t) * VB_SLIDER_INTERNAL_STEPS);
}

export function internalPositionToValue(
  position: number,
  min: number,
  max: number,
  scale: VbSliderScale,
  curvature: number,
  decimals: number,
): number {
  const t = clamp01(position / VB_SLIDER_INTERNAL_STEPS);
  const raw =
    scale === 'exponential' ? exponentialTToValue(t, min, max, curvature) : linearTToValue(t, min, max);
  return roundToDecimals(max > min ? Math.min(max, Math.max(min, raw)) : min, decimals);
}
