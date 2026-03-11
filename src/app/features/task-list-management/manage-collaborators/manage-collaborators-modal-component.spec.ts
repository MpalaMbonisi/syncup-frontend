import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCollaboratorsModalComponent } from './manage-collaborators-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { CollaboratorsService } from '../../../core/services/collaborators-service';
import { of } from 'rxjs';

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
});
