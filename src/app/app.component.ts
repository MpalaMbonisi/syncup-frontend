import { Component } from '@angular/core';
import { Register } from './features/auth/register/register';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Register],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'syncup-frontend';
}
