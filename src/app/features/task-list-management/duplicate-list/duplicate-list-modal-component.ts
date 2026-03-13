import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';
import { STORAGE_KEYS } from '../../../core/constants/app.constants';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { JwtDecoderService } from '../../../core/services/jwt-decoder-service';
import { StorageService } from '../../../core/services/storage-service';

@Component({
  selector: 'app-duplicate-list-modal-component',
  imports: [ReactiveFormsModule],
  templateUrl: './duplicate-list-modal-component.html',
  styleUrl: './duplicate-list-modal-component.scss',
})
export class DuplicateListModalComponent {
  @Output() listDuplicated = new EventEmitter<TaskListResponseDTO>();

  private formBuilder = inject(FormBuilder);
  private taskListService = inject(TaskListService);
  private storageService = inject(StorageService);
  private jwtDecoder = inject(JwtDecoderService);

  duplicateForm: FormGroup;
  isOpen: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  originalList: TaskListResponseDTO | null = null;
  suggestedTitle: string = '';
  currentUsername: string = '';

  constructor() {
    this.duplicateForm = this.formBuilder.group({
      newTitle: [''],
    });
    this.loadCurrentUser();
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

  open(list: TaskListResponseDTO): void {
    this.originalList = list;
    this.suggestedTitle = this.generateSuggestedTitle(list.title);
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.duplicateForm.reset();
    this.errorMessage = '';
    this.originalList = null;
  }

  onBackdropClick(): void {
    this.close();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  private generateSuggestedTitle(originalTitle: string): string {
    // Check if title already has (Copy X) pattern
    const copyPattern = /\(Copy(?: (\d+))?\)$/;
    const match = originalTitle.match(copyPattern);

    if (match) {
      // If has (Copy 2), (Copy 3), etc.
      if (match[1]) {
        const currentNumber = parseInt(match[1], 10);
        return originalTitle.replace(copyPattern, `(Copy ${currentNumber + 1})`);
      }
      // If has just (Copy), make it (Copy 2)
      return originalTitle.replace(copyPattern, '(Copy 2)');
    }

    // No copy pattern, add (Copy)
    return `${originalTitle} (Copy)`;
  }

  duplicateList(): void {
    const customTitle = this.duplicateForm.value.newTitle?.trim();
    const dto = customTitle ? { newTitle: customTitle } : {};

    this.errorMessage = '';
    this.isLoading = true;

    this.taskListService.duplicateList(this.originalList!.id, dto).subscribe({
      next: newList => {
        this.isLoading = false;
        this.listDuplicated.emit(newList);
        this.close();
      },
      error: error => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to duplicate list. Please try again.';
        }
      },
    });
  }

  isOwner(): boolean {
    return this.originalList?.owner.toLowerCase() === this.currentUsername.toLowerCase();
  }

  getTaskCount(): number {
    return this.originalList?.tasks?.length || 0;
  }
}
