import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCollaboratorsModalComponent } from './manage-collaborators-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { CollaboratorsService } from '../../../core/services/collaborators-service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ManageCollaboratorsModalComponent', () => {
  let component: ManageCollaboratorsModalComponent;
  let fixture: ComponentFixture<ManageCollaboratorsModalComponent>;
  let mockCollaboratorsService: {
    getAllCollaborators: jest.Mock;
    addCollaborators: jest.Mock;
    removeCollaborator: jest.Mock;
  };
  let compiled: HTMLElement;

  const mockCollaborators = ['janedoe', 'nicolesmith', 'alicejones'];

  beforeEach(async () => {
    mockCollaboratorsService = {
      getAllCollaborators: jest.fn(),
      addCollaborators: jest.fn(),
      removeCollaborator: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ManageCollaboratorsModalComponent, ReactiveFormsModule],
      providers: [{ provide: CollaboratorsService, useValue: mockCollaboratorsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCollaboratorsModalComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with modal closed', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should initialize form with empty username', () => {
      expect(component.collaboratorForm.get('username')?.value).toBe('');
    });

    it('should initialize with empty collaborators array', () => {
      expect(component.collaborators).toEqual([]);
    });

    it('should initialize loading state as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Modal Visibility', () => {
    it('should not display modal when closed', () => {
      fixture.detectChanges();
      const modal = compiled.querySelector('.modal-overlay');
      expect(modal).toBeNull();
    });

    it('should display modal when opened', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();

      const modal = compiled.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
    });

    it('should load collaborators when opened', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');

      expect(mockCollaboratorsService.getAllCollaborators).toHaveBeenCalledWith(1);
    });

    it('should set list details when opened', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');

      expect(component.listId).toBe(1);
      expect(component.listTitle).toBe('Shopping List');
      expect(component.ownerUsername).toBe('johndoe');
    });

    it('should close modal when close is called', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');
      expect(component.isOpen).toBe(true);

      component.close();
      expect(component.isOpen).toBe(false);
    });

    it('should reset form when modal is closed', () => {
      component.collaboratorForm.patchValue({ username: 'test' });
      component.close();

      expect(component.collaboratorForm.get('username')?.value).toBeNull();
    });

    it('should clear error message when modal is closed', () => {
      component.errorMessage = 'Test error';
      component.close();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();
    });

    it('should display modal title with list name', () => {
      const title = compiled.querySelector('.modal-title');
      expect(title?.textContent).toContain('Manage Collaborators');
    });

    it('should display list title subtitle', () => {
      const subtitle = compiled.querySelector('.list-subtitle');
      expect(subtitle?.textContent).toContain('Shopping List');
    });

    it('should render username input field', () => {
      const input = compiled.querySelector('#username');
      expect(input).toBeTruthy();
    });

    it('should render add button', () => {
      const button = compiled.querySelector('.add-btn');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Add');
    });

    it('should render close button', () => {
      const closeButton = compiled.querySelector('.close-btn');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of([]));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();
    });

    it('should be invalid when username is empty', () => {
      const usernameControl = component.collaboratorForm.get('username');
      expect(usernameControl?.valid).toBe(false);
      expect(usernameControl?.errors?.['required']).toBe(true);
    });

    it('should be valid with proper username', () => {
      const usernameControl = component.collaboratorForm.get('username');
      usernameControl?.setValue('janedoe');

      expect(usernameControl?.valid).toBe(true);
    });

    it('should display error message when field is touched and invalid', () => {
      const usernameControl = component.collaboratorForm.get('username');
      usernameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = compiled.querySelector('.field-error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('Username is required');
    });
  });

  describe('Loading Collaborators', () => {
    it('should display loading state while fetching', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');
      component.isLoadingCollaborators = true;
      fixture.detectChanges();

      const loading = compiled.querySelector('.loading-collaborators');
      expect(loading).toBeTruthy();
    });

    it('should populate collaborators list after loading', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));

      component.open(1, 'Shopping List', 'johndoe');

      expect(component.collaborators).toEqual(mockCollaborators);
    });

    it('should handle error when loading fails', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed to load' } }))
      );

      component.open(1, 'Shopping List', 'johndoe');

      expect(component.errorMessage).toBe('Failed to load');
    });
  });

  describe('Collaborators Display', () => {
    beforeEach(() => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();
    });

    it('should display all collaborators', () => {
      const collaboratorItems = compiled.querySelectorAll('.collaborator-item');
      expect(collaboratorItems.length).toBe(3);
    });

    it('should display collaborator usernames', () => {
      const collaboratorItems = compiled.querySelectorAll('.collaborator-username');
      expect(collaboratorItems[0].textContent).toContain('janedoe');
      expect(collaboratorItems[1].textContent).toContain('nicolesmith');
      expect(collaboratorItems[2].textContent).toContain('alicejones');
    });

    it('should show remove button for each collaborator', () => {
      const removeButtons = compiled.querySelectorAll('.remove-btn');
      expect(removeButtons.length).toBe(3);
    });

    it('should display owner badge', () => {
      const ownerBadge = compiled.querySelector('.owner-badge');
      expect(ownerBadge).toBeTruthy();
      expect(ownerBadge?.textContent).toContain('johndoe');
      expect(ownerBadge?.textContent).toContain('Owner');
    });
  });

  describe('Add Collaborator', () => {
    beforeEach(() => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of([]));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();
    });

    it('should not add when form is invalid', () => {
      component.collaboratorForm.patchValue({ username: '' });

      component.addCollaborator();

      expect(mockCollaboratorsService.addCollaborators).not.toHaveBeenCalled();
    });

    it('should call service with correct data', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        of({ message: 'Collaborator added' })
      );

      component.collaboratorForm.patchValue({ username: 'janedoe' });
      component.addCollaborator();

      expect(mockCollaboratorsService.addCollaborators).toHaveBeenCalledWith(1, {
        collaborators: ['janedoe'],
      });
    });

    it('should add collaborator to list on success', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        of({ message: 'Collaborator added' })
      );

      component.collaboratorForm.patchValue({ username: 'janedoe' });
      component.addCollaborator();

      expect(component.collaborators).toContain('janedoe');
    });

    it('should clear form after adding', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        of({ message: 'Collaborator added' })
      );

      component.collaboratorForm.patchValue({ username: 'janedoe' });
      component.addCollaborator();

      expect(component.collaboratorForm.get('username')?.value).toBeNull();
    });

    it('should emit collaboratorsUpdated event', done => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        of({ message: 'Collaborator added' })
      );

      component.collaboratorsUpdated.subscribe(collaborators => {
        expect(collaborators).toContain('janedoe');
        done();
      });

      component.collaboratorForm.patchValue({ username: 'janedoe' });
      component.addCollaborator();
    });

    it('should display error when username does not exist', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        throwError(() => ({ error: { message: 'User does not exist' } }))
      );

      component.collaboratorForm.patchValue({ username: 'nonexistent' });
      component.addCollaborator();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('User does not exist');
    });

    it('should display error when user is already a collaborator', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        throwError(() => ({ error: { message: 'User is already a collaborator' } }))
      );

      component.collaboratorForm.patchValue({ username: 'janedoe' });
      component.addCollaborator();

      expect(component.errorMessage).toBe('User is already a collaborator');
    });

    it('should prevent adding owner as collaborator', () => {
      component.collaboratorForm.patchValue({ username: 'johndoe' });
      component.addCollaborator();

      expect(mockCollaboratorsService.addCollaborators).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Cannot add the owner as a collaborator');
    });

    it('should trim whitespace from username', () => {
      mockCollaboratorsService.addCollaborators.mockReturnValue(
        of({ message: 'Collaborator added' })
      );

      component.collaboratorForm.patchValue({ username: '  janedoe  ' });
      component.addCollaborator();

      expect(mockCollaboratorsService.addCollaborators).toHaveBeenCalledWith(1, {
        collaborators: ['janedoe'],
      });
    });
  });

  describe('Remove Collaborator', () => {
    beforeEach(() => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();
    });

    it('should show confirmation dialog before removing', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.removeCollaborator('janedoe');

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockCollaboratorsService.removeCollaborator).not.toHaveBeenCalled();
    });

    it('should call service when confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockCollaboratorsService.removeCollaborator.mockReturnValue(
        of({ message: 'Collaborator removed' })
      );

      component.removeCollaborator('janedoe');

      expect(mockCollaboratorsService.removeCollaborator).toHaveBeenCalledWith(1, {
        username: 'janedoe',
      });
    });

    it('should remove collaborator from list on success', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockCollaboratorsService.removeCollaborator.mockReturnValue(
        of({ message: 'Collaborator removed' })
      );

      const initialLength = component.collaborators.length;
      component.removeCollaborator('janedoe');

      expect(component.collaborators.length).toBe(initialLength - 1);
      expect(component.collaborators).not.toContain('janedoe');
    });

    it('should emit collaboratorsUpdated event', done => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockCollaboratorsService.removeCollaborator.mockReturnValue(
        of({ message: 'Collaborator removed' })
      );

      component.collaboratorsUpdated.subscribe(collaborators => {
        expect(collaborators).not.toContain('janedoe');
        done();
      });

      component.removeCollaborator('janedoe');
    });

    it('should handle error when removal fails', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockCollaboratorsService.removeCollaborator.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed to remove' } }))
      );

      component.removeCollaborator('janedoe');

      expect(component.errorMessage).toBe('Failed to remove');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no collaborators', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of([]));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();

      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('No collaborators yet');
    });

    it('should not show empty state when collaborators exist', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of(mockCollaborators));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();

      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeNull();
    });
  });

  describe('Backdrop Click', () => {
    it('should close modal when backdrop is clicked', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of([]));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();

      const backdrop = fixture.debugElement.query(By.css('.modal-overlay'));
      backdrop.nativeElement.click();

      expect(component.isOpen).toBe(false);
    });

    it('should not close when modal content is clicked', () => {
      mockCollaboratorsService.getAllCollaborators.mockReturnValue(of([]));
      component.open(1, 'Shopping List', 'johndoe');
      fixture.detectChanges();

      const event = new MouseEvent('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onModalContentClick(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(component.isOpen).toBe(true);
    });
  });
});
