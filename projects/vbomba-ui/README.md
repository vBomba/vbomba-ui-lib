# vbomba-ui

Standalone Angular UI components with a small theme layer for light/dark apps.

## Install

```bash
npm install vbomba-ui
```

Peer dependencies:

- `@angular/core`, `@angular/common`, `@angular/animations`, `@angular/router`
- `@angular/material`, `@angular/cdk`

## License

MIT — see the `LICENSE` file in the repository root.

## Theme Setup

Import the global vb style pack once in your app styles (tokens, bridge styles, and Lexend fonts).

```scss
@use 'vbomba-ui/theme/vb-global';
```

If you prefer manual setup, you can still import files separately:

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

If you use `VbAppShellComponent` icons, `VbThemeToggleComponent`, `VbButtonComponent` with `iconClass`, or `VbChipComponent`, include **Boxicons** CSS in your host app (see the demo `index.html`).

## Components

| Area | Symbols |
| ---- | ------- |
| Shell & theme | `VbAppShellComponent`, `VbShellNavLink`, `VbThemeToggleComponent`, `VbThemeService` |
| Actions | `VbButtonComponent` (`VbButtonVariant`) |
| Forms | `VbInputComponent`, `VbTextareaComponent`, `VbSelectComponent`, `VbCheckboxComponent`, `VbToggleComponent` |
| Display & feedback | `VbChipComponent`, `VbConnectionIndicatorComponent` (`VbConnectionStatus`), `VbLoaderComponent`, `VbPopupComponent` |
| Data | `VbSimpleTableComponent`, `VbPaginatorComponent` |
| Conversational UI | `VbChatbotComponent`, `VbChatbotMessage`, `VbChatbotHeaderStatus` |

All public exports live in `public-api.ts`.

## Examples

### Buttons

Variants: `filled`, `outlined`, `text`, `elevated`, `icon`. Optional Boxicons on text buttons via `iconClass` / `iconPosition`; icon-only uses `variant="icon"` — set `ariaLabel` when there is no visible label.

```html
<vb-button variant="filled" label="Save" />
<vb-button variant="outlined" label="Cancel" />
<vb-button variant="text" color="warn" label="Delete" />
<vb-button variant="filled" label="Save" iconClass="bx bx-save" />
<vb-button variant="outlined" label="Next" iconClass="bx bx-chevron-right" iconPosition="end" />
<vb-button variant="icon" color="primary" iconClass="bx bx-heart" ariaLabel="Favorites" />
```

### Form controls

```ts
import { Component, model, signal } from '@angular/core';
import {
  VbCheckboxComponent,
  VbInputComponent,
  VbSelectComponent,
  VbTextareaComponent,
  VbToggleComponent,
  type VbSelectOption,
} from 'vbomba-ui';

@Component({
  standalone: true,
  imports: [
    VbCheckboxComponent,
    VbInputComponent,
    VbSelectComponent,
    VbTextareaComponent,
    VbToggleComponent,
  ],
  templateUrl: './profile-form.html',
})
export class ProfileFormComponent {
  readonly name = model('Ada Lovelace');
  readonly notes = model('');
  readonly role = model('eng');
  readonly notifications = model(true);
  readonly wifi = model(true);

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
<vb-toggle [(checked)]="wifi" label="Wi‑Fi" />
<vb-textarea [(value)]="notes" [maxLength]="160" counter placeholder="Notes" />
```

### Chips

```html
<vb-chip label="Angular" />
<vb-chip label="Draft" removable (remove)="onRemoveDraft()" />
<vb-chip removable removeAriaLabel="Remove filter">Beta</vb-chip>
```

### Connection indicator

`status`: `connected` (green glow), `disconnected` (red), `loading` (pulsing amber). Optional `size` (px) and `aria-label`.

```html
<vb-connection-indicator [status]="connStatus()" [size]="12" />
```

### App shell

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

### Table with pagination

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

### Chatbot (streaming + latency + sources)

`VbChatbotMessage` supports streamed assistant replies and optional metadata:

- `streaming?: boolean` - marks a message currently receiving tokens/chunks.
- `responseLatencySeconds?: number` - used for average + last-reply latency indicators.
- `sources?: VbChatbotSource[]` - compact source chips (title link + chunk type).

Use `chatStatus` to show a status pill in the header (`idle`, `streaming`, `thinking`, `busy`, `error`, `offline`).

```ts
import { Component, signal } from '@angular/core';
import {
  VbChatbotComponent,
  type VbChatbotHeaderStatus,
  type VbChatbotMessage,
} from 'vbomba-ui';

@Component({
  standalone: true,
  imports: [VbChatbotComponent],
  templateUrl: './chat-demo.html',
})
export class ChatDemoComponent {
  readonly status = signal<VbChatbotHeaderStatus>({ label: 'Streaming…', tone: 'streaming' });
  readonly loading = signal(false);
  readonly messages = signal<VbChatbotMessage[]>([
    {
      role: 'assistant',
      text: 'Streaming tokenized response from backend...',
      streaming: true,
    },
  ]);
}
```

```html
<vb-chatbot
  title="Assistant"
  [chatStatus]="status()"
  [messages]="messages()"
  [loading]="loading()"
  loadingText="Assistant is typing..."
/>
```

## Build From Source

```bash
npx ng build vbomba-ui
```

The package output is written to `dist/vbomba-ui`.
