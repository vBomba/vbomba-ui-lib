import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDrawerMode, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VbShellNavLink } from './vb-shell-nav-link';
import { VbThemeToggleComponent } from '../theme/vb-theme-toggle.component';
import { VbConnectionIndicatorComponent, type VbConnectionStatus } from '../connection-indicator/vb-connection-indicator.component';
import { VbLoaderComponent } from '../loader/vb-loader.component';
import { VbUserInfoComponent } from '../user-info/vb-user-info.component';
import { VbShellUserInfo } from './vb-shell-user-info';
import { VbShellMainLoader } from './vb-shell-main-loader';
import { VbShellMainLoaderService } from './vb-shell-main-loader.service';

interface VbShellNavRow {
  key: string;
  link: VbShellNavLink;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  childActive: boolean;
}

interface VbShellNavFlyoutState {
  key: string;
  label: string;
  children: VbShellNavLink[];
  top: number;
  left: number;
}

const IS_ACTIVE_OPTS = {
  paths: 'exact' as const,
  queryParams: 'ignored' as const,
  fragment: 'ignored' as const,
  matrixParams: 'ignored' as const,
};

/**
 * App chrome: top header (menu toggle, title, theme) + animated sidenav + main area with route enter animation.
 * Configure the parent route with:
 * `data: { appTitle: string, navLinks: VbShellNavLink[], toolbarConnectionStatus?: VbConnectionStatus, toolbarUserInfo?: VbShellUserInfo, mainLoader?: VbShellMainLoader }`.
 */
@Component({
  selector: 'vb-app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    VbThemeToggleComponent,
    VbConnectionIndicatorComponent,
    VbLoaderComponent,
    VbUserInfoComponent,
  ],
  templateUrl: './vb-app-shell.component.html',
  styleUrl: './vb-app-shell.component.scss',
  animations: [
    trigger('vbMainRoute', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('240ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
})
export class VbAppShellComponent {
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mainLoaderService = inject(VbShellMainLoaderService);

  @ViewChild('drawerContainer') private drawerContainer?: MatSidenavContainer;

  protected readonly appTitle = toSignal(
    this.route.data.pipe(map((d) => (d['appTitle'] as string) ?? 'vbomba-ui')),
    { initialValue: (this.route.snapshot.data['appTitle'] as string) ?? 'vbomba-ui' },
  );

  protected readonly navLinks = toSignal(
    this.route.data.pipe(map((d) => (d['navLinks'] as VbShellNavLink[]) ?? [])),
    { initialValue: (this.route.snapshot.data['navLinks'] as VbShellNavLink[]) ?? [] },
  );
  protected readonly toolbarConnectionStatus = toSignal(
    this.route.data.pipe(map((d) => (d['toolbarConnectionStatus'] as VbConnectionStatus | undefined) ?? null)),
    { initialValue: (this.route.snapshot.data['toolbarConnectionStatus'] as VbConnectionStatus | undefined) ?? null },
  );
  protected readonly toolbarUserInfo = toSignal(
    this.route.data.pipe(map((d) => (d['toolbarUserInfo'] as VbShellUserInfo | undefined) ?? null)),
    { initialValue: (this.route.snapshot.data['toolbarUserInfo'] as VbShellUserInfo | undefined) ?? null },
  );
  protected readonly routeMainLoader = toSignal(
    this.route.data.pipe(map((d) => (d['mainLoader'] as VbShellMainLoader | undefined) ?? null)),
    { initialValue: (this.route.snapshot.data['mainLoader'] as VbShellMainLoader | undefined) ?? null },
  );
  protected readonly mainLoader = computed<VbShellMainLoader | null>(() => {
    const routeConfig = this.routeMainLoader();
    const runtimeOverride = this.mainLoaderService.override();
    if (!routeConfig && !runtimeOverride) {
      return null;
    }
    return {
      ...(routeConfig ?? {}),
      ...(runtimeOverride ?? {}),
    };
  });

  protected readonly isHandset = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = toSignal(
    this.breakpoints
      .observe(Breakpoints.Handset)
      .pipe(map((r) => (r.matches ? 'over' : 'side') as MatDrawerMode)),
    { initialValue: 'side' as MatDrawerMode },
  );

  protected readonly sidenavOpened = signal(!this.isHandset());
  protected readonly sidenavCollapsed = signal(false);
  protected readonly expandedNavKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly navFlyout = signal<VbShellNavFlyoutState | null>(null);

  /** Icon-rail mode: desktop sidenav collapsed (not handset overlay). */
  protected readonly railCollapsed = computed(
    () => !this.isHandset() && this.sidenavCollapsed(),
  );

  protected readonly navRows = computed<VbShellNavRow[]>(() => {
    this.mainRouteState();
    const expanded = this.expandedNavKeys();
    const hideChildren = this.railCollapsed();
    const rows: VbShellNavRow[] = [];

    const walk = (links: VbShellNavLink[], depth: number, prefix: string): void => {
      links.forEach((link, index) => {
        const key = this.navKey(link, `${prefix}${index}`);
        const hasChildren = !!link.children?.length;
        const childActive = hasChildren ? this.branchContainsActive(link) : false;
        const isExpanded = expanded.has(key);
        rows.push({
          key,
          link,
          depth,
          hasChildren,
          expanded: isExpanded,
          childActive,
        });
        // Collapsed rail uses a flyout instead of nesting child rows in the list.
        if (hasChildren && isExpanded && !hideChildren) {
          walk(link.children!, depth + 1, `${prefix}${index}.`);
        }
      });
    };

    walk(this.navLinks(), 0, '');
    return rows;
  });

  /** Boxicons classes for the drawer toggle. */
  protected readonly menuIconClass = computed(() => {
    if (this.isHandset()) {
      return this.sidenavOpened() ? 'bx bx-menu-alt-right' : 'bx bx-menu';
    }
    return this.sidenavCollapsed() ? 'bx bx-menu' : 'bx bx-menu-alt-right';
  });

  protected readonly mainRouteState = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.readAnimationState()),
    ),
    { initialValue: this.readAnimationState() },
  );

  constructor() {
    effect(() => {
      const mobile = this.isHandset();
      this.sidenavOpened.set(!mobile);
      this.sidenavCollapsed.set(false);
      untracked(() => this.closeNavFlyout());
      queueMicrotask(() => this.flushDrawerMargins());
    });

    effect(() => {
      this.mainRouteState();
      const links = this.navLinks();
      untracked(() => this.expandActiveAncestors(links));
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.navFlyout()) {
      return;
    }
    const target = event.target as Element | null;
    if (
      target?.closest('.vb-app-shell__nav-flyout') ||
      target?.closest('.vb-app-shell__nav-group')
    ) {
      return;
    }
    this.closeNavFlyout();
  }

  @HostListener('document:keydown.escape')
  protected onDocumentEscape(): void {
    this.closeNavFlyout();
  }

  protected toggleSidenav(): void {
    this.closeNavFlyout();
    if (this.isHandset()) {
      this.sidenavOpened.set(!this.sidenavOpened());
      this.flushDrawerMargins();
      return;
    }
    this.sidenavCollapsed.set(!this.sidenavCollapsed());
    this.sidenavOpened.set(true);
    this.flushDrawerMargins();
  }

  protected onSidenavOpenedChange(opened: boolean): void {
    this.sidenavOpened.set(opened);
  }

  protected onNavigate(): void {
    this.closeNavFlyout();
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  protected isNavGroupExpanded(row: VbShellNavRow): boolean {
    if (this.railCollapsed()) {
      return this.navFlyout()?.key === row.key;
    }
    return row.expanded;
  }

  protected toggleNavGroup(row: VbShellNavRow, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.railCollapsed()) {
      const open = this.navFlyout();
      if (open?.key === row.key) {
        this.closeNavFlyout();
        return;
      }
      const anchor = event.currentTarget as HTMLElement | null;
      // Defer past the same-tick document:click that would otherwise close immediately.
      queueMicrotask(() => this.openNavFlyout(row, anchor));
      return;
    }

    this.closeNavFlyout();
    this.expandedNavKeys.update((keys) => {
      const next = new Set(keys);
      if (next.has(row.key)) {
        next.delete(row.key);
      } else {
        next.add(row.key);
      }
      return next;
    });
  }

  protected onNavFlyoutClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  private openNavFlyout(row: VbShellNavRow, anchor: HTMLElement | null): void {
    const children = row.link.children ?? [];
    if (!children.length) {
      this.closeNavFlyout();
      return;
    }

    let top = 8;
    let left = 72;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      const estimatedHeight = children.length * 40 + 16;
      top = Math.min(rect.top, Math.max(8, window.innerHeight - estimatedHeight - 8));
      left = rect.right + 8;
    }

    this.navFlyout.set({
      key: row.key,
      label: row.link.label,
      children,
      top,
      left,
    });
  }

  private closeNavFlyout(): void {
    if (this.navFlyout()) {
      this.navFlyout.set(null);
    }
  }

  private navKey(link: VbShellNavLink, indexPath: string): string {
    return link.path ?? `group:${indexPath}:${link.label}`;
  }

  private leafIsActive(link: VbShellNavLink): boolean {
    if (!link.path) {
      return false;
    }
    const tree = this.router.createUrlTree([link.path], { relativeTo: this.route });
    return this.router.isActive(tree, IS_ACTIVE_OPTS);
  }

  private branchContainsActive(link: VbShellNavLink): boolean {
    return (link.children ?? []).some((child) =>
      child.children?.length ? this.branchContainsActive(child) : this.leafIsActive(child),
    );
  }

  private expandActiveAncestors(links: VbShellNavLink[]): void {
    const keysToAdd: string[] = [];

    const walk = (nodes: VbShellNavLink[], prefix: string): boolean => {
      let anyActive = false;
      nodes.forEach((link, index) => {
        const key = this.navKey(link, `${prefix}${index}`);
        const childActive = link.children?.length
          ? walk(link.children, `${prefix}${index}.`)
          : this.leafIsActive(link);
        if (childActive && link.children?.length) {
          keysToAdd.push(key);
        }
        anyActive = anyActive || childActive;
      });
      return anyActive;
    };

    walk(links, '');
    if (!keysToAdd.length) {
      return;
    }
    this.expandedNavKeys.update((keys) => {
      const next = new Set(keys);
      for (const key of keysToAdd) {
        next.add(key);
      }
      return next;
    });
  }

  private flushDrawerMargins(): void {
    this.cdr.detectChanges();
    this.drawerContainer?.updateContentMargins();
  }

  private readAnimationState(): string {
    let route: ActivatedRoute | null = this.router.routerState.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    const snap = route?.snapshot;
    if (!snap) {
      return 'default';
    }
    const data = snap.data as { animation?: string };
    const key = data?.['animation'] as string | undefined;
    if (key) return key;
    const path = snap.url.map((s) => s.path).join('/') || 'home';
    return path;
  }
}
