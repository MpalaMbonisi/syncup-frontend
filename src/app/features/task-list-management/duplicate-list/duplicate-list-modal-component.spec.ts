import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateListModalComponent } from './duplicate-list-modal-component';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';

describe('DuplicateListModalComponent', () => {
  let component: DuplicateListModalComponent;
  let fixture: ComponentFixture<DuplicateListModalComponent>;
  let mockTaskListService: {
    duplicateList: jest.Mock;
  };
  let compiled: HTMLElement;

  const mockOriginalList: TaskListResponseDTO = {
    id: 1,
    title: 'Shopping List',
    owner: 'johndoe',
    collaborators: ['janedoe'],
    tasks: [
      { id: 1, description: 'Buy milk', completed: false, taskListTitle: 'Shopping List' },
      { id: 2, description: 'Buy bread', completed: true, taskListTitle: 'Shopping List' },
    ],
  };

  beforeEach(async () => {
    mockTaskListService = {
      duplicateList: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DuplicateListModalComponent],
      providers: [{ provide: TaskListService, useValue: mockTaskListService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicateListModalComponent);
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

    it('should initialize form with empty title', () => {
      expect(component.duplicateForm.get('newTitle')?.value).toBe('');
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
      component.open(mockOriginalList);
      fixture.detectChanges();

      const modal = compiled.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
    });

    it('should set original list details when opened', () => {
      component.open(mockOriginalList);

      expect(component.originalList).toEqual(mockOriginalList);
      expect(component.suggestedTitle).toBe('Shopping List (Copy)');
    });

    it('should set form placeholder to suggested title', () => {
      component.open(mockOriginalList);
      fixture.detectChanges();

      const input = compiled.querySelector('#newTitle') as HTMLInputElement;
      expect(input?.placeholder).toBe('Shopping List (Copy)');
    });

    it('should close modal when close is called', () => {
      component.open(mockOriginalList);
      expect(component.isOpen).toBe(true);

      component.close();
      expect(component.isOpen).toBe(false);
    });

    it('should reset form when modal is closed', () => {
      component.duplicateForm.patchValue({ newTitle: 'test' });
      component.close();

      expect(component.duplicateForm.get('newTitle')?.value).toBeNull();
    });

    it('should clear error message when modal is closed', () => {
      component.errorMessage = 'Test error';
      component.close();

      expect(component.errorMessage).toBe('');
    });
  });
});
