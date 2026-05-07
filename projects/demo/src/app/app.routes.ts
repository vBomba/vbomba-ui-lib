import { Routes } from '@angular/router';
import {
  VbAppShellComponent,
  VbShellNavLink,
  type VbConnectionStatus,
  type VbShellMainLoader,
  type VbShellUserInfo,
} from 'vbomba-ui';

import { ShowcaseComponent } from './showcase/showcase.component';

const demoNavLinks: VbShellNavLink[] = [
  { path: 'showcase', label: 'Showcase', icon: 'bx bx-palette' },
  { path: 'about', label: 'About', icon: 'bx bx-info-circle' },
];
const demoToolbarConnectionStatus: VbConnectionStatus = 'connected';
const demoToolbarUserInfo: VbShellUserInfo = {
  login: 'vbomba',
  username: 'Vasyl Bomba',
  sessionDurationSeconds: 45 * 60,
  initialRemainingSeconds: 18 * 60 + 35,
};
const demoMainLoader: VbShellMainLoader = {
  visible: true,
  size: 24,
  ariaLabel: 'Loading current route content',
};

export const routes: Routes = [
  {
    path: '',
    component: VbAppShellComponent,
    data: {
      appTitle: 'vbomba-ui demo',
      navLinks: demoNavLinks,
      toolbarConnectionStatus: demoToolbarConnectionStatus,
      toolbarUserInfo: demoToolbarUserInfo,
      mainLoader: demoMainLoader,
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'showcase' },
      {
        path: 'showcase',
        component: ShowcaseComponent,
        data: { animation: 'showcase' },
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
        data: { animation: 'about' },
      },
    ],
  },
];
