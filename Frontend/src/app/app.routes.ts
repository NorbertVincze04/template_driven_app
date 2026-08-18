import { Routes } from '@angular/router';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SignInComponent,
    data: { showBars: false },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { showBars: false },
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
