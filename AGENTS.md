# vbomba-ui-lib — agent notes

## Purpose

**Angular 21** monorepo: publishable library **`vbomba-ui`** (`projects/vbomba-ui`) and demo app **`demo`** (`projects/demo`). The demo showcases components, theme, and app shell; the library is what consumers would publish to npm.

## Layout

| Path | Role |
|------|------|
| `projects/vbomba-ui/` | Library: components, theme, shell. Public API: `src/public-api.ts`. |
| `projects/vbomba-ui/src/lib/theme/` | `vb-color-tokens.scss`, `vb-material-bridge.scss`, `VbThemeService`, `VbThemeToggleComponent`. |
| `projects/vbomba-ui/src/lib/shell/` | `VbAppShellComponent`, type `VbShellNavLink`. |
| `projects/vbomba-ui/src/lib/textarea/`, `.../select/` | `VbTextareaComponent`, `VbSelectComponent` — native-styled fields (chromadb-desc parity). |
| `projects/demo/` | Demo: routes, showcase, global styles `src/styles.scss`. |
| `design/` | Paper layouts / exports, reference HTML. |
| `dist/vbomba-ui/theme/` | Theme SCSS copied from the library on `ng build vbomba-ui` (`ng-package.json` → `assets`). |

## Commands

- `npm start` — `ng serve demo` (http://localhost:4200).
- `npx ng build vbomba-ui` — build library to `dist/vbomba-ui`.
- `npx ng build demo` — build demo.

## Code principles

1. **Standalone** — new components use `standalone: true` only; avoid extra NgModules.
2. **Minimal diff** — do not refactor unrelated files; scope changes to the task.
3. **Public API** — anything exported to consumers belongs in `projects/vbomba-ui/src/public-api.ts`.
4. **Library peer dependencies** — see `projects/vbomba-ui/package.json` (`@angular/material`, `@angular/cdk`, `@angular/router`, `@angular/animations`, …). Do not add unnecessary runtime `dependencies` without a reason.
5. **`sideEffects: true`** on the library package — do not turn off without checking (animations / side-effect imports).

## Colors and theme

- All UI colors use **CSS custom properties** from `vb-color-tokens.scss` (`--vb-palette-*` / `--vb-color-*`). Details and the rule against raw hex in components: `.cursor/rules/vbomba-ui-colors.mdc`.
- Global Material button / toolbar styling aligned with chromadb-desc lives in `vb-material-bridge.scss`; the demo loads it from `projects/demo/src/styles.scss` via `@use`.
- **Light/dark** theme on `body`: classes `app-light-theme` / `app-dark-theme`; initialize with `VbThemeService.init()` at the app root (see demo `App`).

## App shell (`VbAppShellComponent`)

- Rendered as the **parent** route; route `data` supplies **`appTitle`** (string) and **`navLinks`** (`VbShellNavLink[]`: `path`, `label`, **`icon`** — **Boxicons** classes, e.g. `bx bx-palette`). Host apps must include Boxicons CSS (as in `projects/demo/src/index.html`).
- Child routes render inside `<router-outlet>` in the shell; set **`data.animation`** (unique string per page) for content transitions.
- Optional header slot: **`[vbShellHeaderActions]`** (ng-content).

## Using the library from the demo

Root `tsconfig.json` maps **`vbomba-ui`** to `projects/vbomba-ui/src/public-api.ts` so development does not require a prior `ng build` of the library.

## Design docs (Paper)

- Update Paper layouts via MCP **`plugin-paper-desktop-paper`** (not `paper`), with Paper Desktop running.
- The Paper file uses two artboards (**light** and **dark**) with the **same layer hierarchy**; only styles (colors, shadows, borders) differ per `vb-color-tokens`. **Dark UI in Paper** is a separate artboard, not Paper Desktop’s own theme toggle (see `design/README.txt`).
- Files under `design/` are reference-only; after Paper edits you may refresh exports (e.g. `get_jsx`) as needed.

## Do not

- Duplicate theme with “magic” hex in demo/library component SCSS — extend tokens instead.
- Bump Angular/Material across the monorepo without an explicit task and alignment with `chromadb-desc` if the library must stay compatible.
- Remove `provideAnimationsAsync()` from the demo — required for the shell and Material.

## Useful context files

- `projects/demo/src/app/app.routes.ts` — shell + child routes.
- `projects/vbomba-ui/src/lib/shell/vb-app-shell.component.*` — shell markup and animations.
- Reference UX for a similar layout: `chromadb-desc` → `dashboard-layout` (other repo, orientation only).
