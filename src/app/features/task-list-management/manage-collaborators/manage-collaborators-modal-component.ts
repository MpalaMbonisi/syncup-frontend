import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollaboratorsService } from '../../../core/services/collaborators-service';

@Component({
  selector: 'app-manage-collaborators-modal-component',
  imports: [ReactiveFormsModule],
  templateUrl: './manage-collaborators-modal-component.html',
  styleUrl: './manage-collaborators-modal-component.scss',
})
export class ManageCollaboratorsModalComponent {
  @Output() collaboratorsUpdated = new EventEmitter<string[]>();

  private formBuilder = inject(FormBuilder);
  private collaboratorsService = inject(CollaboratorsService);

  collaboratorForm: FormGroup;
  isOpen: boolean = false;
  isLoading: boolean = false;
  isLoadingCollaborators: boolean = false;
  errorMessage: string = '';

  listId: number = 0;
  listTitle: string = '';
  ownerUsername: string = '';
  collaborators: string[] = [];

  constructor() {
    this.collaboratorForm = this.formBuilder.group({
      username: ['', Validators.required],
    });
  }

  open(listId: number, listTitle: string, ownerUsername: string): void {
    this.listId = listId;
    this.listTitle = listTitle;
    this.ownerUsername = ownerUsername;
    this.isOpen = true;
    this.loadCollaborators();
  }

  close(): void {
    this.isOpen = false;
    this.collaboratorForm.reset();
    this.errorMessage = '';
    this.collaborators = [];
  }

  onBackdropClick(): void {
    this.close();
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  private loadCollaborators(): void {
    this.isLoadingCollaborators = true;
    this.errorMessage = '';

    this.collaboratorsService.getAllCollaborators(this.listId).subscribe({
      next: collaborators => {
        this.collaborators = collaborators;
        this.isLoadingCollaborators = false;
      },
      error: error => {
        this.isLoadingCollaborators = false;
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to load collaborators. Please try again.';
        }
      },
    });
  }

  addCollaborator(): void {
    if (this.collaboratorForm.valid) {
      const username = this.collaboratorForm.value.username.trim();

      // Prevent adding owner as collaborator
      if (username.toLowerCase() === this.ownerUsername.toLowerCase()) {
        this.errorMessage = 'Cannot add the owner as a collaborator';
        return;
      }

      this.errorMessage = '';
      this.isLoading = true;

      this.collaboratorsService
        .addCollaborators(this.listId, { collaborators: [username] })
        .subscribe({
          next: () => {
            this.collaborators.push(username);
            this.collaboratorForm.reset();
            this.isLoading = false;
            this.collaboratorsUpdated.emit(this.collaborators);
          },
          error: error => {
            this.isLoading = false;
            if (error.error && error.error.message) {
              this.errorMessage = Array.isArray(error.error.message)
                ? error.error.message.join(', ')
                : error.error.message;
            } else {
              this.errorMessage = 'Failed to add collaborator. Please try again.';
            }
          },
        });
    }
  }

  removeCollaborator(username: string): void {
    if (!confirm(`Are you sure you want to remove ${username} from this list?`)) {
      return;
    }

    this.collaboratorsService.removeCollaborator(this.listId, { username }).subscribe({
      next: () => {
        this.collaborators = this.collaborators.filter(c => c !== username);
        this.errorMessage = '';
        this.collaboratorsUpdated.emit(this.collaborators);
      },
      error: error => {
        if (error.error && error.error.message) {
          this.errorMessage = Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message;
        } else {
          this.errorMessage = 'Failed to remove collaborator. Please try again.';
        }
      },
    });
  }
}
