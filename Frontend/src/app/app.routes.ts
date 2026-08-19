import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    data: { showBars: true },
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
    path: '**',
    component: NotFoundComponent,
    data: { showBars: false },
  },
];
