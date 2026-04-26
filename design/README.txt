Design handoff for vbomba-ui (Paper Desktop + MCP plugin-paper-desktop-paper).

Paper file (open in Paper Desktop):
- Artboard "vbomba-ui showcase" (light) — 960×1200. Same layer tree as dark.
- Artboard "vbomba-ui — dark (tokens)" — 960×1200. Same structure as light; only fills, borders, text colours, and shadows use night / violet tokens (see body.app-dark-theme in vb-color-tokens.scss).

Hero copy is identical on both frames; only styling differs.

Темна тема в Paper:
- У самому Paper Desktop немає глобального «dark mode» для інтерфейсу редактора (на відміну від демо Angular з body.app-dark-theme).
- Щоб подивитися темний UI — відкрий другий артборд «vbomba-ui — dark (tokens)» на полотні (або збільши прев’ю цього фрейму).
- Інтерактивне перемикання light/dark — у додатку-демо vbomba-ui, не в Paper.

Секція «App shell» у Paper: шари **Header** (mat-toolbar), **Menu** (mat-sidenav + nav), **Main** (mat-sidenav-content) — як у `vb-app-shell.component.html`.

Якщо блок зник або виглядає як «лінія»: кореневий фрейм App shell у flex-колонці артборду міг отримати висоту ~0 до явного **minHeight** (~380px) і **flex: 0 0 auto** (виправлено через MCP). У дереві перевір `get_node_info` (width/height), а не лише computed height для flex.

Іконка **theme toggle** у Paper: замість stroke-only SVG використано **filled path** (moon), щоб іконка була видима в малому розмірі.

**CSS-змінні з `vb-color-tokens.scss`** (палітра + семантика світлої теми) задані на корені **App shell** світлого артборду; на темному артборді — ті самі `--vb-palette-*` + семантика **`body.app-dark-theme`**. Частина елементів shell використовує `var(--vb-color-*)` / `var(--vb-shell-drawer-ms)` для кольорів, тіней і `transition` ширини sidenav. Джерело правди в коді: `projects/vbomba-ui/src/lib/theme/vb-color-tokens.scss`.

Repo exports (optional refresh from Paper via MCP get_jsx):
- paper-vbomba-ui-sticker.from-paper.tsx — JSX export (reference).
- paper-sticker-sheet.html — static HTML showcase (light only; regenerate if needed).

Color system in Angular: projects/vbomba-ui/src/lib/theme/vb-color-tokens.scss — published under dist/vbomba-ui/theme/*.scss.
