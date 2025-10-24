import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { Router } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, FooterComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  username: string = '';

  ngOnInit(): void {
    this.username = 'User'; // Placeholder value
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    this.router.navigate([ROUTES.LOGIN]);
  }
}
