import { Component } from '@angular/core';
import { RegisterComponent } from './features/auth/register-component/register-component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RegisterComponent],
})
export class AppComponent {
  title = 'syncup-frontend';
}
