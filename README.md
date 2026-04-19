# vbomba-ui-lib

Angular 21 monorepo: **`vbomba-ui`** (publishable UI library) and **`demo`** (showcase app).

## Prerequisites

- Node.js and npm (versions aligned with Angular 21).
- For local path mapping, use the root `tsconfig.json` (the demo imports `vbomba-ui` from `projects/vbomba-ui/src/public-api.ts`).

## Development server

```bash
npm start
```

Runs `ng serve demo` at http://localhost:4200. The app reloads when you change source files.

## Build

```bash
npx ng build vbomba-ui
```

Outputs the library to `dist/vbomba-ui` (including theme assets under `dist/vbomba-ui/theme/`).

```bash
npx ng build demo
```

Production build of the demo to `dist/demo/`.

## Tests

```bash
ng test
```

Uses the configured unit test runner (e.g. Vitest) for the workspace.

## What’s inside

| Area | Path |
|------|------|
| Library source | `projects/vbomba-ui/` |
| Demo app | `projects/demo/` |
| Design / Paper notes | `design/` |
| Agent-oriented repo notes | `AGENTS.md` |

Theme tokens and Material bridge SCSS live under `projects/vbomba-ui/src/lib/theme/`. See `AGENTS.md` for colors, shell routing, and Paper workflow.

## Angular CLI

This repo uses [Angular CLI](https://github.com/angular/angular-cli). For schematic help:

```bash
ng generate --help
```

More CLI documentation: [Angular CLI overview](https://angular.dev/tools/cli).
