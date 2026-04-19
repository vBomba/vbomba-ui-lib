import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDrawerMode, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VbShellNavLink } from './vb-shell-nav-link';
import { VbThemeToggleComponent } from '../theme/vb-theme-toggle.component';

/**
 * App chrome: top header (menu toggle, title, theme) + animated sidenav + main area with route enter animation.
 * Configure the parent route with `data: { appTitle: string, navLinks: VbShellNavLink[] }`.
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
  ],
  templateUrl: './vb-app-shell.component.html',
  styleUrl: './vb-app-shell.component.scss',
  animations: [
    trigger('vbMainRoute', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '240ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'none' }),
        ),
      ]),
    ]),
  ],
})
export class VbAppShellComponent {
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('drawerContainer') private drawerContainer?: MatSidenavContainer;

  protected readonly appTitle = toSignal(
    this.route.data.pipe(map((d) => (d['appTitle'] as string) ?? 'vbomba-ui')),
    { initialValue: (this.route.snapshot.data['appTitle'] as string) ?? 'vbomba-ui' },
  );

  protected readonly navLinks = toSignal(
    this.route.data.pipe(map((d) => (d['navLinks'] as VbShellNavLink[]) ?? [])),
    { initialValue: (this.route.snapshot.data['navLinks'] as VbShellNavLink[]) ?? [] },
  );

  protected readonly isHandset = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(
      map((r) => (r.matches ? 'over' : 'side') as MatDrawerMode),
    ),
    { initialValue: 'side' as MatDrawerMode },
  );

  protected readonly sidenavOpened = signal(!this.isHandset());
  protected readonly sidenavCollapsed = signal(false);

  /** Boxicons classes for the drawer toggle (ecolabel-apps / chromadb-desc pattern). */
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
      queueMicrotask(() => this.flushDrawerMargins());
    });
  }

  protected toggleSidenav(): void {
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
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
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
