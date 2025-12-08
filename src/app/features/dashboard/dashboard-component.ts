import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { Router } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, FooterComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private jwtDecoder = inject(JwtDecoderService);
  private taskListService = inject(TaskListService);

  username: string = '';
  isTokenExpired: boolean = false;
  taskLists: TaskListResponseDTO[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadTaskLists();
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
   * Load all task lists for the current user
   */
  private loadTaskLists(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskListService.getAllLists().subscribe({
      next: lists => {
        this.taskLists = lists;
        this.isLoading = false;
        console.log('Task lists loaded:', lists.length);
      },
      error: error => {
        console.error('Error loading task lists:', error);
        this.errorMessage = 'Failed to load task lists. Please try again.';
        this.isLoading = false;

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.logout();
        }
      },
    });
  }

  /**
   * Get the count of incomplete tasks for a list
   */
  getIncompleteTaskCount(list: TaskListResponseDTO): number {
    return list.tasks.filter(task => !task.completed).length;
  }

  /**
   * Get the count of completed tasks for a list
   */
  getCompletedTaskCount(list: TaskListResponseDTO): number {
    return list.tasks.filter(task => task.completed).length;
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
