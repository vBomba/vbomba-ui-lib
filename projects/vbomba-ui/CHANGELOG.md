# Changelog

## 0.2.0

### Added

- `vb-alert` — inline alerts with `tone` (`neutral` | `info` | `success` | `warn` | `error`), optional `title`, `dismissible`, and `dismiss` output.
- `vb-empty-state` — `title`, optional `description`, `iconClass`; actions via `ng-content` with `[vbEmptyActions]`.
- `vb-radio-group` — native radio list with `[(value)]`, `options`, optional `legend`, `layout`, `name`.
- `vb-slider` — linear / exponential scale, optional value input (exported from public API).
- `vb-toast-stack` + `VbToastStackService` — timed toasts, timer bar, pause on hover, append to `document.body`, `insetTopClearance` for toolbars, `position` corners.

### Changed

- `vb-chatbot`: optional `textureGrid` with `textureBackdrop`; message area uses grid texture (no vignette) when enabled.

### Fixed

- `vb-empty-state`: spacing between projected action buttons (`::ng-deep` + `display: contents` on `[vbEmptyActions]`).
