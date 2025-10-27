import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { LoginComponent } from './features/auth/login-component/login-component';
import { ROUTES } from './core/constants/app.constants';
import { DashboardComponent } from './features/dashboard/dashboard-component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // redirect empty path to login
  { path: '', redirectTo: ROUTES.LOGIN, pathMatch: 'full' },

  // public routes (no auth required)
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  // protected routes (auth required)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  // wildcard route - redirect unknown paths to login
  { path: '**', redirectTo: 'login' },
];
