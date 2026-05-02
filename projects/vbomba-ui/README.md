# vbomba-ui

Standalone Angular UI components with a small theme layer for light/dark apps.

## Install

```bash
npm install vbomba-ui
```

Peer dependencies:

- `@angular/core`, `@angular/common`, `@angular/animations`, `@angular/router`
- `@angular/material`, `@angular/cdk`

## Theme Setup

Import the theme SCSS once in your app styles.

```scss
@use 'vbomba-ui/theme/vb-color-tokens';
@use 'vbomba-ui/theme/vb-material-bridge';
```

Apply one of the theme classes to `body`:

```html
<body class="app-light-theme">
  <app-root></app-root>
</body>
```

For runtime switching, initialize `VbThemeService` in your root component.

```ts
import { Component, inject } from '@angular/core';
import { VbThemeService } from 'vbomba-ui';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly theme = inject(VbThemeService);

  constructor() {
    this.theme.init();
  }
}
```

If you use `VbAppShellComponent` icons or `VbThemeToggleComponent`, include Boxicons in your host app.

## Components

- `VbAppShellComponent` / `VbShellNavLink`
- `VbThemeToggleComponent` / `VbThemeService`
- `VbButtonComponent`
- `VbInputComponent`
- `VbTextareaComponent`
- `VbSelectComponent`
- `VbCheckboxComponent`
- `VbSimpleTableComponent`
- `VbPaginatorComponent`
- `VbPopupComponent`
- `VbLoaderComponent`

## Examples

### Buttons

```html
<vb-button variant="filled" label="Save" />
<vb-button variant="outlined" label="Cancel" />
<vb-button variant="text" color="warn" label="Delete" />
```

### Form Controls

```ts
import { Component, model, signal } from '@angular/core';
import {
  VbCheckboxComponent,
  VbInputComponent,
  VbSelectComponent,
  VbTextareaComponent,
  type VbSelectOption,
} from 'vbomba-ui';

@Component({
  standalone: true,
  imports: [VbCheckboxComponent, VbInputComponent, VbSelectComponent, VbTextareaComponent],
  templateUrl: './profile-form.html',
})
export class ProfileFormComponent {
  readonly name = model('Ada Lovelace');
  readonly notes = model('');
  readonly role = model('eng');
  readonly notifications = model(true);

  readonly roleOptions = signal<VbSelectOption[]>([
    { value: 'eng', label: 'Engineer' },
    { value: 'design', label: 'Designer' },
  ]);
}
```

```html
<vb-input [(value)]="name" [maxLength]="32" counter placeholder="Display name" />
<vb-select [(value)]="role" [options]="roleOptions()" placeholder="Choose a role" />
<vb-checkbox [(checked)]="notifications" label="Enable notifications" />
<vb-textarea [(value)]="notes" [maxLength]="160" counter placeholder="Notes" />
```

### App Shell

```ts
import { Routes } from '@angular/router';
import { VbAppShellComponent, type VbShellNavLink } from 'vbomba-ui';

const navLinks: VbShellNavLink[] = [
  { path: 'dashboard', label: 'Dashboard', icon: 'bx bx-home' },
  { path: 'settings', label: 'Settings', icon: 'bx bx-cog' },
];

export const routes: Routes = [
  {
    path: '',
    component: VbAppShellComponent,
    data: {
      appTitle: 'My app',
      navLinks,
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      // child routes...
    ],
  },
];
```

### Table With Pagination

```html
<vb-simple-table [columns]="columns()" [rows]="rows()" [pageSize]="10" [(page)]="page" pagination />
```

### Popup

```html
<vb-popup [(open)]="open" title="Confirm action" subtitle="Review before continuing.">
  <p>This content is projected into the popup body.</p>

  <div vbPopupActions>
    <vb-button variant="text" label="Cancel" (click)="open.set(false)" />
    <vb-button variant="filled" label="Apply" (click)="open.set(false)" />
  </div>
</vb-popup>
```

## Build From Source

```bash
npx ng build vbomba-ui
```

The package output is written to `dist/vbomba-ui`.
