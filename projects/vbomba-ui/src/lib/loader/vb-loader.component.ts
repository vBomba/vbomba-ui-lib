import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

export type VbLoaderVariant = 'spinner' | 'horizontal';

@Component({
  selector: 'vb-loader',
  standalone: true,
  templateUrl: './vb-loader.component.html',
  styleUrl: './vb-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[attr.aria-label]': 'ariaLabel()',
    '[style.--vb-loader-size.px]': 'size()',
    '[class.vb-loader--horizontal]': "variant() === 'horizontal'",
  },
})
export class VbLoaderComponent {
  readonly variant = input<VbLoaderVariant>('spinner');
  readonly size = input(48, { transform: numberAttribute });
  readonly ariaLabel = input('Loading', { alias: 'aria-label' });
}
