/**
 * One item in the app shell side navigation.
 * Icons use [Boxicons](https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css) — pass full classes, e.g. `bx bx-palette`.
 * Consumers must load Boxicons CSS in the app shell host (not bundled inside vbomba-ui).
 */
export interface VbShellNavLink {
  path: string;
  label: string;
  /** Boxicons classes, e.g. `bx bx-palette`, `bx bx-info-circle`. */
  icon: string;
  /** Optional key for route `data.animation` (main content transition). Defaults to `path`. */
  animation?: string;
}
