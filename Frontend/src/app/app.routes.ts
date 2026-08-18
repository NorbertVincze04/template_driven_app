import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [],
    data: { showBars: true },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { showBars: false },
  },
];
