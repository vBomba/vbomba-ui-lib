# Changelog

## 0.3.0

### Added

- `vb-tree-page-picker` — nested page tree (`VbTreePageNode` at any depth) with optional `filterable` search.
- `vb-hint` — inline hint with optional icon tone.
- `vb-chatbot` composer: `@` mention menu grouped into Roles / Sources; optional `roleOption`; at most one role chip, always leftmost.
- Content-editable composer so chips sit inline and typed text wraps around them; field grows with content.
- App shell sidenav: nested levels use a guide rail, muted tint, and quieter typography.
- `vb-chatbot` enriched RAG sources: `VbChatbotSource.fragments`, `citeIndex`, `score`; multi-fragment source cards.
- Collapsible sources list via `sourcesCollapsible` / `sourcesCollapsedByDefault` / `sourcesSummaryLabel`.
- Inline `[n]` citation markers in markdown (`citationMarkersEnabled`) with hover highlight against matching source chips.
- Public helpers: `vbChatbotWrapCitationMarkers`, `vbChatbotParseCiteIndexesFromTitle`, `vbChatbotFormatSourceScore`, `vbChatbotDefaultSourcesSummary`.

### Changed

- Chatbot attachments wrap with the draft; placeholder hides when chips are present.

### Fixed

- Composer close-chip hover no longer stretches the chip height.
- Tree picker row height stays stable while filtering.
- Citation marker styles apply to `[innerHTML]` markdown (encapsulation pierce); markers use theme primary text color and `cursor: pointer`.

## 0.2.2

### Added

- `vb-chatbot` enriched RAG sources: `VbChatbotSource.fragments`, `citeIndex`, `score`; multi-fragment source cards.
- Collapsible sources list via `sourcesCollapsible` / `sourcesCollapsedByDefault` / `sourcesSummaryLabel`.
- Inline `[n]` citation markers in markdown (`citationMarkersEnabled`) with hover highlight against matching source chips.
- Public helpers: `vbChatbotWrapCitationMarkers`, `vbChatbotParseCiteIndexesFromTitle`, `vbChatbotFormatSourceScore`, `vbChatbotDefaultSourcesSummary`.

### Fixed

- Citation marker styles apply to `[innerHTML]` markdown (encapsulation pierce); markers use theme primary text color and `cursor: pointer`.

## 0.2.2

### Fixed

- `vb-card` with `tabs`: project body content reliably (single `ng-content`), show bordered card surface only under the tab row.
- Tabbed card layout: tabs render above the card frame (`display: contents` host + internal stack), no gap between tabs and body, active tab merges with the body top edge.
- `vb-tab` on card: rectangular folder style with top radius only; exclude `.vb-tab` from global Material `button` border-radius overrides.
- Align `marked` dependency to `^18.0.4`.

## 0.2.1

### Fixed

- Publish follow-up patch release after `0.2.0` was already published.
- Align published `marked` dependency with the monorepo (`^18.0.4`, was `^17.0.0`).

## 0.2.0

### Added

- `vb-alert` — inline alerts with `tone` (`neutral` | `info` | `success` | `warn` | `error`), optional `title`, `dismissible`, and `dismiss` output.
- `vb-empty-state` — `title`, optional `description`, `iconClass`; actions via `ng-content` with `[vbEmptyActions]`.
- `vb-radio-group` — native radio list with `[(value)]`, `options`, optional `legend`, `layout`, `name`.
- `vb-slider` — linear / exponential scale, optional value input (exported from public API).
- `vb-toast-stack` + `VbToastStackService` — timed toasts, timer bar, pause on hover, append to `document.body`, `insetTopClearance` for toolbars, `position` corners.
- `vb-chatbot`: like/dislike on completed assistant replies (`feedback` on `VbChatbotMessage`, `(messageFeedback)` output).
- `vb-chatbot`: markdown rendering for completed assistant replies (`markdownEnabled`), copy to clipboard, auto-scroll and scroll-to-latest button (`autoScrollEnabled`).
- `vb-tab`, `vb-tabs`, `vb-sticky-tabs-section` — tab UI with optional sticky header in a rounded section shell.
- `vb-card`: optional `tabs` / `[(tabValue)]` with sticky tab row and scrollable body (`tabBodyMaxHeight`).

### Changed

- `vb-chatbot`: optional `textureGrid` with `textureBackdrop`; message area uses grid texture (no vignette) when enabled.

### Fixed

- `vb-empty-state`: spacing between projected action buttons (`::ng-deep` + `display: contents` on `[vbEmptyActions]`).
