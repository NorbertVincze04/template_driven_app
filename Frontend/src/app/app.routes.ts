import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { HelpCenterComponent } from './features/help-center/help-center.component';
import { TermsOfServiceComponent } from './features/terms-of-service/terms-of-service.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AppointmentServiceComponent } from './features/appointment-service/appointment-service.component';
import { ServicesComponent } from './features/barber-services/barber-services.component';
import { BarbersPreviewComponent } from './features/barbers-preview/barbers-preview.component';

export const routes: Routes = [
  {
    path: 'services',
    component: ServicesComponent,
    data: { showBars: true },
  },
  {
    path: 'barbers-preview',
    component: BarbersPreviewComponent,
    data: { showBars: true },
  },
  {
    path: 'appointment-service',
    component: AppointmentServiceComponent,
    data: { showBars: true },
  },
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
    canActivate: [AuthGuard],
    data: { showBars: true },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { showBars: false },
  },
];
