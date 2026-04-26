import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

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
  },
})
export class VbLoaderComponent {
  readonly size = input(48, { transform: numberAttribute });
  readonly ariaLabel = input('Loading', { alias: 'aria-label' });
}
