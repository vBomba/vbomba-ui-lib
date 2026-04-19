import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VbThemeService } from 'vbomba-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(VbThemeService);

  protected readonly title = signal('vbomba-ui demo');

  constructor() {
    this.theme.init();
  }
}
