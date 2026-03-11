import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCollaboratorsModalComponent } from './manage-collaborators-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { CollaboratorsService } from '../../../core/services/collaborators-service';

describe('ManageCollaboratorsModalComponent', () => {
  let component: ManageCollaboratorsModalComponent;
  let fixture: ComponentFixture<ManageCollaboratorsModalComponent>;
  let mockCollaboratorsService: {
    getAllCollaborators: jest.Mock;
    addCollaborators: jest.Mock;
    removeCollaborator: jest.Mock;
  };
  // let compiled: HTMLElement;

  // const mockCollaborators = ['janedoe', 'bobsmith', 'alicejones'];

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
    fixture.detectChanges();
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
});
