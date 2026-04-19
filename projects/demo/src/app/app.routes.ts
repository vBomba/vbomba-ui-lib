import { Routes } from '@angular/router';
import { VbAppShellComponent, VbShellNavLink } from 'vbomba-ui';

import { ShowcaseComponent } from './showcase/showcase.component';

const demoNavLinks: VbShellNavLink[] = [
  { path: 'showcase', label: 'Sticker sheet', icon: 'bx bx-palette' },
  { path: 'about', label: 'About', icon: 'bx bx-info-circle' },
];

export const routes: Routes = [
  {
    path: '',
    component: VbAppShellComponent,
    data: {
      appTitle: 'vbomba-ui demo',
      navLinks: demoNavLinks,
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
