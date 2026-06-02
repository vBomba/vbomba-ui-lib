import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'vb-tab',
  standalone: true,
  templateUrl: './vb-tab.component.html',
  styleUrl: './vb-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbTabComponent {
  readonly label = input<string>('');
  readonly value = input<string>('');
  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly iconClass = input<string>('');

  readonly select = output<string>();
}

