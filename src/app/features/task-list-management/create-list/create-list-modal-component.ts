import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';
import { VALIDATION } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-create-list-modal-component',
  imports: [ReactiveFormsModule],
  templateUrl: './create-list-modal-component.html',
  styleUrl: './create-list-modal-component.scss',
})
export class CreateListModalComponent {
  @Output() listCreated = new EventEmitter<TaskListResponseDTO>();

  private formBuilder = inject(FormBuilder);
  private taskListService = inject(TaskListService);

  listForm: FormGroup;
  isOpen: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  readonly maxTitleLength = VALIDATION.TITLE_MAX_LENGTH;

  constructor() {
    this.listForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(VALIDATION.TITLE_MAX_LENGTH)]],
    });
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.listForm.reset();
    this.errorMessage = '';
  }

  onBackdropClick(): void {
    this.close();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.listForm.valid) {
      this.errorMessage = '';
      this.isLoading = true;

      this.taskListService.createList(this.listForm.value).subscribe({
        next: response => {
          this.isLoading = false;
          this.listCreated.emit(response);
          this.close();
        },
        error: error => {
          this.isLoading = false;

          if (error.error && error.error.message) {
            this.errorMessage = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else {
            this.errorMessage = 'Failed to create list. Please try again.';
          }
        },
      });
    }
  }
}
