import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vb-card',
  standalone: true,
  templateUrl: './vb-card.component.html',
  styleUrl: './vb-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vb-card-host',
  },
})
export class VbCardComponent {}
