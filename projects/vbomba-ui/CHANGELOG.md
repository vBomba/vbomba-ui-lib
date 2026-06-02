# Changelog

## 0.2.1

### Fixed

- Publish follow-up patch release after `0.2.0` was already published.

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
