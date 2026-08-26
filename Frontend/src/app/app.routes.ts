import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { HelpCenterComponent } from './features/help-center/help-center.component';
import { TermsOfServiceComponent } from './features/terms-of-service/terms-of-service.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';

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
    path: 'help',
    component: HelpCenterComponent,
    data: { showBars: true },
  },
  {
    path: 'terms',
    component: TermsOfServiceComponent,
    data: { showBars: true },
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    data: { showBars: true },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { showBars: false },
  },
];
