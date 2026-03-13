// dashboard-component.ts
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FooterComponent } from '../../shared/components/footer-component/footer-component';
import { HeaderComponent } from '../../shared/components/header-component/header-component';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';
import { StorageService } from '../../core/services/storage-service';
import { CreateListModalComponent } from '../task-list-management/create-list/create-list-modal-component';
import { ManageCollaboratorsModalComponent } from '../task-list-management/manage-collaborators/manage-collaborators-modal-component';
import { DuplicateListModalComponent } from '../task-list-management/duplicate-list/duplicate-list-modal-component';
import {
  ContextMenuComponent,
  MenuItem,
} from '../../shared/components/context-menu-component/context-menu-component';

@Component({
  selector: 'app-dashboard-component',
  imports: [
    FooterComponent,
    HeaderComponent,
    CreateListModalComponent,
    ContextMenuComponent,
    ManageCollaboratorsModalComponent,
    DuplicateListModalComponent,
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  @ViewChild(CreateListModalComponent) createListModal!: CreateListModalComponent;
  @ViewChild(ManageCollaboratorsModalComponent)
  manageCollaboratorsModal!: ManageCollaboratorsModalComponent;
  @ViewChild(DuplicateListModalComponent) duplicateListModal!: DuplicateListModalComponent;

  private router = inject(Router);
  private jwtDecoder = inject(JwtDecoderService);
  private taskListService = inject(TaskListService);
  private storageService = inject(StorageService);

  username: string = '';
  isTokenExpired: boolean = false;
  taskLists: TaskListResponseDTO[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadTaskLists();
    this.loadViewPreference();
  }

  private loadUserInfo(): void {
    const token = this.storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);

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

    this.username = this.capitalizeFirstLetter(user.username);

    const userData = {
      username: user.username,
      issuedAt: user.issuedAt.toISOString(),
      expiresAt: user.expiresAt.toISOString(),
    };
    this.storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  public loadTaskLists(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskListService.getAllLists().subscribe({
      next: (lists: TaskListResponseDTO[]) => {
        this.taskLists = lists;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading task lists:', error);
        this.errorMessage = 'Failed to load task lists. Please try again.';
        this.isLoading = false;

        if (error.status === 401) {
          this.logout();
        }
      },
    });
  }

  getIncompleteTaskCount(list: TaskListResponseDTO): number {
    return (list.tasks || []).filter(task => !task.completed).length;
  }

  getCompletedTaskCount(list: TaskListResponseDTO): number {
    return (list.tasks || []).filter(task => task.completed).length;
  }

  getTotalCompletedTasks(): number {
    return this.taskLists.reduce((total, list) => total + this.getCompletedTaskCount(list), 0);
  }

  getTotalPendingTasks(): number {
    return this.taskLists.reduce((total, list) => total + this.getIncompleteTaskCount(list), 0);
  }

  getTotalCollaborations(): number {
    return this.taskLists.filter(list => !this.isOwner(list)).length;
  }

  isOwner(list: TaskListResponseDTO): boolean {
    return list.owner.toLowerCase() === this.username.toLowerCase();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.storageService.setItem('dashboardViewMode', mode);
  }

  private loadViewPreference(): void {
    const savedMode = this.storageService.getItem('dashboardViewMode') as 'grid' | 'list' | null;
    if (savedMode === 'grid' || savedMode === 'list') {
      this.viewMode = savedMode;
    }
  }

  viewList(list: TaskListResponseDTO): void {
    this.router.navigate(['/list', list.id]);
  }

  getContextMenuItems(list: TaskListResponseDTO): MenuItem[] {
    const isOwner = this.isOwner(list);

    return [
      {
        id: 'view',
        label: 'View Details',
        icon: 'eye',
        action: () => this.viewList(list),
      },
      {
        id: 'edit',
        label: 'Edit Title',
        icon: 'edit',
        action: () => this.editListTitle(list),
        visible: isOwner,
      },
      {
        id: 'share',
        label: 'Manage Collaborators',
        icon: 'users',
        action: () => this.manageCollaborators(list),
        visible: isOwner, // Only owners can manage collaborators
      },
      {
        id: 'duplicate',
        label: 'Duplicate List',
        icon: 'copy',
        action: () => this.duplicateList(list),
      },
      {
        id: 'delete',
        label: 'Delete List',
        icon: 'trash',
        action: () => this.deleteList(list),
        danger: true,
        visible: isOwner,
      },
    ];
  }

  editListTitle(list: TaskListResponseDTO): void {
    // Navigate to list view where user can edit title
    this.viewList(list);
  }

  manageCollaborators(list: TaskListResponseDTO): void {
    this.manageCollaboratorsModal.open(list.id, list.title, list.owner);
  }

  onCollaboratorsUpdated(listId: number, updatedCollaborators: string[]): void {
    // Update the list in the dashboard
    const list = this.taskLists.find(l => l.id === listId);
    if (list) {
      list.collaborators = updatedCollaborators;
    }
  }

  duplicateList(list: TaskListResponseDTO): void {
    this.duplicateListModal.open(list);
  }

  onListDuplicated(newList: TaskListResponseDTO): void {
    // Add the new duplicated list to the beginning of the array
    this.taskLists.unshift(newList);
  }

  deleteList(list: TaskListResponseDTO): void {
    if (
      !confirm(
        `Are you sure you want to delete "${list.title}"? This will delete all tasks in this list.`
      )
    ) {
      return;
    }

    this.taskListService.deleteList(list.id).subscribe({
      next: () => {
        this.taskLists = this.taskLists.filter(l => l.id !== list.id);
      },
      error: error => {
        console.error('Failed to delete list:', error);
        this.errorMessage = 'Failed to delete list. Please try again.';
      },
    });
  }

  createNewList(): void {
    this.createListModal.open();
  }

  onListCreated(newList: TaskListResponseDTO): void {
    this.taskLists.unshift(newList);
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.storageService.removeItem(STORAGE_KEYS.USER_DATA);
    this.router.navigate([ROUTES.LOGIN]);
  }
}
