import { Component, inject, OnInit } from '@angular/core';
import { STORAGE_KEYS, ROUTES } from '../../../core/constants/app.constants';
import {
  TaskItemResponseDTO,
  TaskListResponseDTO,
  TaskListService,
} from '../../../core/services/task-list-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task-service';
import { StorageService } from '../../../core/services/storage-service';
import { JwtDecoderService } from '../../../core/services/jwt-decoder-service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header-component/header-component';
import { FooterComponent } from '../../../shared/components/footer-component/footer-component';

@Component({
  selector: 'app-view-list-component',
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './view-list-component.html',
  styleUrl: './view-list-component.scss',
})
export class ViewListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskListService = inject(TaskListService);
  private taskService = inject(TaskService);
  private storageService = inject(StorageService);
  private jwtDecoder = inject(JwtDecoderService);

  list: TaskListResponseDTO | null = null;
  listId: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  newTaskDescription: string = '';
  isEditingTitle: boolean = false;
  editedTitle: string = '';
  currentUsername: string = '';

  ngOnInit(): void {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      this.listId = +params['id'];
      this.loadList();
    });
  }

  private loadCurrentUser(): void {
    const token = this.storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      const user = this.jwtDecoder.getUserFromToken(token);
      if (user) {
        this.currentUsername = user.username;
      }
    }
  }

  loadList(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskListService.getListById(this.listId).subscribe({
      next: list => {
        this.list = list;
        // Ensure tasks is an array
        if (!this.list.tasks) {
          this.list.tasks = [];
        }
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to load list. Please try again.';
        }

        if (error.status === 401 || error.status === 404) {
          setTimeout(() => this.router.navigate([ROUTES.DASHBOARD]), 2000);
        }
      },
    });
  }

  addTask(): void {
    if (!this.newTaskDescription || !this.newTaskDescription.trim()) {
      return;
    }

    this.taskService.createTask(this.listId, { description: this.newTaskDescription }).subscribe({
      next: newTask => {
        if (this.list) {
          if (!this.list.tasks) {
            this.list.tasks = [];
          }
          this.list.tasks.push(newTask);
        }
        this.newTaskDescription = '';
        this.errorMessage = '';
      },
      error: error => {
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to create task. Please try again.';
        }
      },
    });
  }

  toggleTaskStatus(task: TaskItemResponseDTO): void {
    this.taskService
      .updateTaskStatus(this.listId, task.id, { completed: !task.completed })
      .subscribe({
        next: updatedTask => {
          if (this.list && this.list.tasks) {
            const index = this.list.tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
              this.list.tasks[index] = updatedTask;
            }
          }
          this.errorMessage = '';
        },
        error: error => {
          if (error.error && error.error.message) {
            this.errorMessage = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else {
            this.errorMessage = 'Failed to update task. Please try again.';
          }
        },
      });
  }

  deleteTask(task: TaskItemResponseDTO): void {
    if (!confirm(`Are you sure you want to delete "${task.description}"?`)) {
      return;
    }

    this.taskService.deleteTask(this.listId, task.id).subscribe({
      next: () => {
        if (this.list && this.list.tasks) {
          this.list.tasks = this.list.tasks.filter(t => t.id !== task.id);
        }
        this.errorMessage = '';
      },
      error: error => {
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to delete task. Please try again.';
        }
      },
    });
  }

  startEditingTitle(): void {
    this.isEditingTitle = true;
    this.editedTitle = this.list?.title || '';
  }

  saveTitle(): void {
    if (!this.editedTitle.trim()) {
      return;
    }

    this.taskListService.updateListTitle(this.listId, { title: this.editedTitle }).subscribe({
      next: updatedList => {
        if (this.list) {
          this.list.title = updatedList.title;
        }
        this.isEditingTitle = false;
        this.errorMessage = '';
      },
      error: error => {
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to update title. Please try again.';
        }
      },
    });
  }

  cancelEditingTitle(): void {
    this.isEditingTitle = false;
    this.editedTitle = '';
  }

  deleteList(): void {
    if (
      !confirm(
        `Are you sure you want to delete "${this.list?.title}"? This will delete all tasks in this list.`
      )
    ) {
      return;
    }

    this.taskListService.deleteList(this.listId).subscribe({
      next: () => {
        this.router.navigate([ROUTES.DASHBOARD]);
      },
      error: error => {
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to delete list. Please try again.';
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES.DASHBOARD]);
  }

  isOwner(): boolean {
    return this.list?.owner.toLowerCase() === this.currentUsername.toLowerCase();
  }

  getCompletedCount(): number {
    return (this.list?.tasks || []).filter(t => t.completed).length;
  }

  getTotalCount(): number {
    return (this.list?.tasks || []).length;
  }

  getProgressPercentage(): number {
    const total = this.getTotalCount();
    if (total === 0) return 0;
    return Math.round((this.getCompletedCount() / total) * 100);
  }
}
