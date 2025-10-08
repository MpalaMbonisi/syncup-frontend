import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { LoginComponent } from './features/auth/login-component/login-component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
