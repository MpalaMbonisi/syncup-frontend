import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES, STORAGE_KEYS } from '../../../core/constants/app.constants';
import { AccountService, UserResponseDTO } from '../../../core/services/account-service';

@Component({
  selector: 'app-header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})
export class HeaderComponent implements OnInit {
  @Input() username: string = '';

  private router = inject(Router);
  private accountService = inject(AccountService);

  isSettingsModalOpen: boolean = false;
  accountDetails: UserResponseDTO | null = null;
  isLoadingAccountDetails: boolean = false;
  accountDetailsError: string = '';
  isDeletingAccount: boolean = false;

  ngOnInit(): void {
    // Load account details when component initializes
    this.loadAccountDetails();
  }

  loadAccountDetails(): void {
    this.isLoadingAccountDetails = true;
    this.accountDetailsError = '';

    this.accountService.getAccountDetails().subscribe({
      next: details => {
        this.accountDetails = details;
        this.isLoadingAccountDetails = false;
        console.log('Account details loaded:', details);
      },
      error: error => {
        console.error('Failed to load account details:', error);
        this.accountDetailsError = 'Failed to load account details';
        this.isLoadingAccountDetails = false;

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.logout();
        }
      },
    });
  }

  openSettings(): void {
    this.isSettingsModalOpen = true;
  }

  closeSettings(): void {
    this.isSettingsModalOpen = false;
  }

  onBackdropClick(): void {
    this.closeSettings();
  }

  onModalContentClick(event: Event): void {
    // Prevent backdrop click from closing modal when clicking inside
    event.stopPropagation();
  }

  navigateToDashboard(): void {
    this.router.navigate([ROUTES.DASHBOARD]);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    this.closeSettings();
    this.router.navigate([ROUTES.LOGIN]);
  }

  deleteAccount(): void {
    const confirmMessage =
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.';

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isDeletingAccount = true;

    this.accountService.deleteAccount().subscribe({
      next: () => {
        console.log('Account deleted successfully');
        alert('Your account has been deleted successfully.');
        this.isDeletingAccount = false;
        this.logout();
      },
      error: error => {
        console.error('Failed to delete account:', error);
        this.isDeletingAccount = false;

        const errorMessage = error.error?.message || 'Failed to delete account. Please try again.';
        alert(errorMessage);
      },
    });
  }
}
