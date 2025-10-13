import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { LoginComponent } from './features/auth/login-component/login-component';
import { ROUTES } from './core/constants/app.constants';

export const routes: Routes = [
  { path: '', redirectTo: ROUTES.LOGIN, pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];
