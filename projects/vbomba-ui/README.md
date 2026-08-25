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
| Display & feedback | `VbAlertComponent`, `VbChipComponent`, `VbConnectionIndicatorComponent` (`VbConnectionStatus`), `VbEmptyStateComponent`, `VbHintComponent` (`VbHintIconTone`), `VbLoaderComponent`, `VbPopupComponent`, `VbToastStackComponent` |
| Data | `VbSimpleTableComponent`, `VbPaginatorComponent`, `VbTreePagePickerComponent` (`VbTreePageNode`) |
| Navigation | `VbTabComponent`, `VbTabsComponent`, `VbStickyTabsSectionComponent` (`VbTabItem`) |
| Conversational UI | `VbChatbotComponent`, `VbChatbotMessage`, `VbChatbotHeaderStatus`, `VbChatbotConversationOption`, `VbChatbotComposerAttachment`, `VbChatbotSourceOption`, `VbChatbotSendEvent`, citation helpers (`vbChatbotWrapCitationMarkers`, …) |

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

### Hints

`vb-hint` shows a Boxicons tip icon with a short `title`. Long text via `description` and/or projected content; toggle with `[(expanded)]` (or set `expandable="false"` to keep the body always open). Override the icon with `iconClass` and its color with `iconTone` (`primary` | `muted` | `success` | `warn` | `error`).

```html
<vb-hint
  title="Theme tokens"
  description="Prefer --vb-color-* semantic tokens in component SCSS. Extend vb-color-tokens.scss when you need a new role instead of hardcoding hex values."
  [(expanded)]="hintOpen"
/>

<vb-hint
  title="Always visible"
  [expandable]="false"
  iconClass="bx bx-bulb"
  iconTone="warn"
>
  Projected body stays open when expandable is false.
</vb-hint>
```

### App shell

```ts
import { Routes } from '@angular/router';
import { VbAppShellComponent, type VbShellNavLink } from 'vbomba-ui';

const navLinks: VbShellNavLink[] = [
  { path: 'dashboard', label: 'Dashboard', icon: 'bx bx-home' },
  {
    label: 'Settings',
    icon: 'bx bx-cog',
    children: [
      { path: 'profile', label: 'Profile', icon: 'bx bx-user' },
      { path: 'billing', label: 'Billing', icon: 'bx bx-credit-card' },
    ],
  },
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

To control the shell horizontal loader reactively (e.g. from HTTP/interceptors), use
`VbShellMainLoaderService`. Runtime overrides take precedence over `route.data.mainLoader`.

```ts
import { Injectable, inject } from '@angular/core';
import { VbShellMainLoaderService } from 'vbomba-ui';

@Injectable({ providedIn: 'root' })
export class HttpLoaderBridge {
  private readonly shellLoader = inject(VbShellMainLoaderService);

  onRequestStart(): void {
    this.shellLoader.show({ ariaLabel: 'Loading data...' });
  }

  onRequestDone(): void {
    this.shellLoader.hide();
  }

  resetToRouteDefaults(): void {
    this.shellLoader.clear();
  }
}
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
- `sources?: VbChatbotSource[]` - RAG citations under assistant replies. Each source has `href`, `pageTitle`, and legacy `chunkType`. Prefer `fragments?: { label, score? }[]` for multi-row cards; optional `citeIndex` / `score` for `[n]` hover highlight and page relevance.
- `feedback?: 'like' | 'dislike' | null` - thumbs up/down on a completed assistant reply.
- `feedbackComment?: string | null` - optional note when `feedback` is `dislike`.

Use `chatStatus` to show a status pill in the header (`idle`, `streaming`, `thinking`, `busy`, `error`, `offline`).

When `streaming` is false, completed assistant replies render as **Markdown** (`markdownEnabled`, default `true`). Plain text is shown while tokens stream in. Bare `[n]` markers become citation superscripts (`citationMarkersEnabled`, default `true`) that highlight matching source chips on hover.

**Sources UI** — `sourcesCollapsible` wraps chips in a `<details>` disclosure; `sourcesCollapsedByDefault` (default `true`); localize the summary with `sourcesSummaryLabel`. Helpers `vbChatbotWrapCitationMarkers`, `vbChatbotParseCiteIndexesFromTitle`, and `vbChatbotDefaultSourcesSummary` are exported for host apps (e.g. DocBot).

**Copy** — header copy icon on assistant messages; hover copy on user bubbles. Emits `(messageCopy)` after a successful clipboard write.

**Scroll** — `autoScrollEnabled` (default `true`) keeps the viewport pinned to the latest message unless the user scrolls up; a floating control returns to the bottom.

**Composer attachments** — bind `[(attachments)]`, `[sourceOptions]`, and optional `[roleOptions]` (amber role chips; selecting one replaces any previous role and always sits leftmost). Legacy `[roleOption]` still works and merges with `roleOptions`. The composer is a **contenteditable** field: chips float on the left and typed text wraps around them; height grows with content (up to a max, then scrolls). Typing `@` opens a menu with **Roles** and **Sources** section headers (`roleMentionGroupLabel` / `sourceMentionGroupLabel`) so kinds are not a flat list. Optional `placeholder` (empty/omitted hides it). Suggestions match `label` / `description` (case-insensitive). Arrow keys + Enter/Tab select; Escape dismisses. `sourceMentionLimit` caps source rows only. Default `composerAttachmentKinds` is `['source', 'role']`; include `'rule'` for an add-rule button. `(send)` emits `{ text, attachments }` (`VbChatbotSendEvent`). User messages may echo `attachments` on the bubble.

### Tree page picker

```html
<vb-tree-page-picker
  selectionMode="single"
  filterable
  [nodes]="pages"
  [(value)]="pageId"
  aria-label="Pages"
/>
```

`VbTreePageNode.children` may nest to any depth; rows indent by level and expand/collapse via the chevron. Use `selectionMode="multiple"` with `[(values)]` when multi-page selection is needed. Set `filterable` for an optional search field (`[(filterQuery)]`, `filterPlaceholder`) that matches `label` / `description` and keeps ancestor branches visible.

Like/dislike icons appear in the message header row — to the right of the latency bar when present. After dislike, an optional comment field is shown (`dislikeFeedbackTextEnabled`, labels via `dislikeFeedbackLabel` / `dislikeFeedbackPlaceholder`). Handle `(messageFeedback)` to update `feedback` and `feedbackComment`; commit on blur, Enter, or **Send feedback**.

```ts
import { Component, model, signal } from '@angular/core';
import {
  VbChatbotComponent,
  type VbChatbotComposerAttachment,
  type VbChatbotHeaderStatus,
  type VbChatbotMessage,
  type VbChatbotSendEvent,
  type VbChatbotSourceOption,
  type VbSelectOption,
} from 'vbomba-ui';

@Component({
  standalone: true,
  imports: [VbChatbotComponent],
  templateUrl: './chat-demo.html',
})
export class ChatDemoComponent {
  readonly status = signal<VbChatbotHeaderStatus>({ label: 'Streaming…', tone: 'streaming' });
  readonly loading = signal(false);
  readonly conversationId = model('c1');
  readonly conversations = signal<VbSelectOption[]>([
    { value: 'c1', label: 'Deployment status' },
    { value: 'c2', label: 'Theme tokens' },
  ]);
  readonly attachments = model<VbChatbotComposerAttachment[]>([]);
  readonly sourceOptions = signal<VbChatbotSourceOption[]>([
    { value: 'design-tokens', label: 'Design tokens', description: 'Color and radius tokens' },
    { value: 'angular-docs', label: 'Angular docs', description: 'Official Angular documentation' },
  ]);
  readonly roleOptions = signal<VbChatbotSourceOption[]>([
    {
      value: 'ops-lead',
      label: 'Ops lead',
      description: 'Deployment and incident response persona',
    },
    {
      value: 'docs-writer',
      label: 'Docs writer',
      description: 'Clear technical documentation persona',
    },
  ]);
  readonly messages = signal<VbChatbotMessage[]>([
    {
      role: 'assistant',
      text: 'Streaming tokenized response from backend...',
      streaming: true,
    },
  ]);

  onSend(event: VbChatbotSendEvent): void {
    this.messages.update((items) => [
      ...items,
      { role: 'user', text: event.text, attachments: event.attachments },
    ]);
  }
}
```

```html
<vb-chatbot
  title="Assistant"
  placeholder="Ask anything… Type @ to add a source or role"
  [conversations]="conversations()"
  [(conversationId)]="conversationId"
  [(attachments)]="attachments"
  [sourceOptions]="sourceOptions()"
  [roleOptions]="roleOptions()"
  [chatStatus]="status()"
  [messages]="messages()"
  [loading]="loading()"
  loadingText="Assistant is typing..."
  (send)="onSend($event)"
  (newConversation)="/* create thread */"
/>
```

## Build From Source

```bash
npx ng build vbomba-ui
```

The package output is written to `dist/vbomba-ui`.
