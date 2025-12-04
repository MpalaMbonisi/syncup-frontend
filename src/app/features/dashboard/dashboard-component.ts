import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { Router } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, FooterComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private jwtDecoder = inject(JwtDecoderService);

  username: string = '';
  isTokenExpired: boolean = false;

  ngOnInit(): void {
    this.loadUserInfo();
  }

  /**
   * Load user information from JWT token
   */
  private loadUserInfo(): void {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      console.warn('No token found, redirecting to login');
      this.logout();
      return;
    }

    const user = this.jwtDecoder.getUserFromToken(token);

    if (!user) {
      console.error('Failed to decode token, redirecting to login');
      this.logout();
      return;
    }

    if (user.isExpired) {
      console.warn('Token is expired, redirecting to login');
      this.isTokenExpired = true;
      this.logout();
      return;
    }

    // Set username
    this.username = this.capitalizeFirstLetter(user.username);

    // Optional: Store user data for later use
    const userData = {
      username: user.username,
      issuedAt: user.issuedAt.toISOString(),
      expiresAt: user.expiresAt.toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

    console.log('User loaded:', this.username);
    console.log('Token expires at:', user.expiresAt);
  }

  /**
   * Capitalize first letter of username for display
   */
  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    this.router.navigate([ROUTES.LOGIN]);
  }
}
