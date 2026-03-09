import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListModalComponent } from './create-list-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';
import { VALIDATION } from '../../../core/constants/app.constants';
import { of, Subject, throwError } from 'rxjs';

describe('CreateListModalComponent', () => {
  let component: CreateListModalComponent;
  let fixture: ComponentFixture<CreateListModalComponent>;
  let mockTaskListService: { createList: jest.Mock };
  let compiled: HTMLElement;

  beforeEach(async () => {
    mockTaskListService = {
      createList: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreateListModalComponent, ReactiveFormsModule],
      providers: [{ provide: TaskListService, useValue: mockTaskListService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateListModalComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty title', () => {
      expect(component.listForm.get('title')?.value).toBe('');
    });

    it('should initialize isOpen as false', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should initialize loading state as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Modal Visibility', () => {
    it('should not display modal when isOpen is false', () => {
      const modal = compiled.querySelector('.modal-overlay');
      expect(modal).toBeNull();
    });

    it('should display modal when isOpen is true', () => {
      component.open();
      fixture.detectChanges();

      const modal = compiled.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
    });

    it('should open modal when open() is called', () => {
      expect(component.isOpen).toBe(false);

      component.open();

      expect(component.isOpen).toBe(true);
    });

    it('should close modal when close() is called', () => {
      component.open();
      expect(component.isOpen).toBe(true);

      component.close();

      expect(component.isOpen).toBe(false);
    });

    it('should reset form when modal is closed', () => {
      component.listForm.patchValue({ title: 'Test Title' });
      component.close();

      expect(component.listForm.get('title')?.value).toBeNull();
    });

    it('should clear error message when modal is closed', () => {
      component.errorMessage = 'Test error';
      component.close();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.open();
      fixture.detectChanges();
    });

    it('should display modal title', () => {
      const modalTitle = compiled.querySelector('.modal-title');

      expect(modalTitle).toBeTruthy();
      expect(modalTitle!.textContent).toContain('Create New Task List');
    });

    it('should render title input field', () => {
      const titleInput = compiled.querySelector('#listTitle');

      expect(titleInput).toBeTruthy();
      expect(titleInput?.getAttribute('type')).toBe('text');
    });

    it('should render close button', () => {
      const closeButton = compiled.querySelector('.close-btn');

      expect(closeButton).toBeTruthy();
    });

    it('should render cancel button', () => {
      const cancelButton = compiled.querySelector('.cancel-btn');

      expect(cancelButton).toBeTruthy();
      expect(cancelButton!.textContent).toContain('Cancel');
    });

    it('should render create button', () => {
      const createButton = compiled.querySelector('.create-btn');

      expect(createButton).toBeTruthy();
      expect(createButton!.textContent).toContain('Create');
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when title is empty', () => {
      const titleControl = component.listForm.get('title');

      expect(titleControl?.valid).toBe(false);
      expect(titleControl?.errors?.['required']).toBe(true);
    });

    it('should be invalid when title exceeds max length', () => {
      const titleControl = component.listForm.get('title');
      const longTitle = 'a'.repeat(VALIDATION.TITLE_MAX_LENGTH + 1);

      titleControl?.setValue(longTitle);

      expect(titleControl?.valid).toBe(false);
      expect(titleControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with proper title', () => {
      const titleControl = component.listForm.get('title');
      titleControl?.setValue('My Shopping List');

      expect(titleControl?.valid).toBe(true);
    });

    it('should display error message when field is touched and invalid', () => {
      component.open();
      fixture.detectChanges();

      const titleControl = component.listForm.get('title');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = compiled.querySelector('.field-error');

      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.textContent).toContain('Title is required');
    });

    it('should display max length error when exceeded', () => {
      component.open();
      fixture.detectChanges();

      const titleControl = component.listForm.get('title');
      const longTitle = 'a'.repeat(VALIDATION.TITLE_MAX_LENGTH + 1);

      titleControl?.setValue(longTitle);
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = compiled.querySelector('.field-error');

      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.textContent).toContain(
        `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`
      );
    });
  });

  describe('Submit Button State', () => {
    beforeEach(() => {
      component.open();
      fixture.detectChanges();
    });

    it('should be disabled when form is invalid', () => {
      const createButton = compiled.querySelector('.create-btn') as HTMLButtonElement;

      expect(createButton.disabled).toBe(true);
    });

    it('should be enabled when form is valid', () => {
      component.listForm.patchValue({ title: 'Valid Title' });
      fixture.detectChanges();

      const createButton = compiled.querySelector('.create-btn') as HTMLButtonElement;

      expect(createButton.disabled).toBe(false);
    });

    it('should be disabled when loading', () => {
      component.listForm.patchValue({ title: 'Valid Title' });
      component.isLoading = true;
      fixture.detectChanges();

      const createButton = compiled.querySelector('.create-btn') as HTMLButtonElement;

      expect(createButton.disabled).toBe(true);
    });

    it('should display "Creating..." text when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const createButton = compiled.querySelector('.create-btn');

      expect(createButton!.textContent).toContain('Creating...');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.open();
      fixture.detectChanges();
    });

    it('should not submit when form is invalid', () => {
      component.listForm.patchValue({ title: '' });

      component.onSubmit();

      expect(mockTaskListService.createList).not.toHaveBeenCalled();
    });

    it('should call taskListService.createList with correct data', () => {
      mockTaskListService.createList.mockReturnValue(
        of({
          id: 1,
          title: 'New List',
          owner: 'nicolesmith',
          collaborators: [],
          tasks: [],
        })
      );

      component.listForm.patchValue({ title: 'New List' });

      component.onSubmit();

      expect(mockTaskListService.createList).toHaveBeenCalledWith({ title: 'New List' });
    });

    it('should set loading state during submission', () => {
      const createListSubject = new Subject<TaskListResponseDTO>();
      mockTaskListService.createList.mockReturnValue(createListSubject.asObservable());

      component.listForm.patchValue({ title: 'New List' });

      expect(component.isLoading).toBe(false);

      component.onSubmit();

      expect(component.isLoading).toBe(true);

      createListSubject.next({
        id: 1,
        title: 'New List',
        owner: 'nicolesmith',
        collaborators: [],
        tasks: [],
      });
      expect(component.isLoading).toBe(false);
    });

    it('should clear error message on submit', () => {
      mockTaskListService.createList.mockReturnValue(
        of({
          id: 1,
          title: 'New List',
          owner: 'nicolesmith',
          collaborators: [],
          tasks: [],
        })
      );

      component.errorMessage = 'Previous error';
      component.listForm.patchValue({ title: 'New List' });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      component.open();
      fixture.detectChanges();
    });

    it('should emit listCreated event on success', done => {
      const mockResponse = {
        id: 1,
        title: 'New List',
        owner: 'johndoe',
        collaborators: [],
        tasks: [],
      };

      mockTaskListService.createList.mockReturnValue(of(mockResponse));

      component.listCreated.subscribe(list => {
        expect(list).toEqual(mockResponse);
        done();
      });

      component.listForm.patchValue({ title: 'New List' });
      component.onSubmit();
    });

    it('should close modal on success', () => {
      mockTaskListService.createList.mockReturnValue(
        of({
          id: 1,
          title: 'New List',
          owner: 'johndoe',
          collaborators: [],
          tasks: [],
        })
      );

      component.listForm.patchValue({ title: 'New List' });
      component.onSubmit();

      expect(component.isOpen).toBe(false);
    });

    it('should reset loading state on success', () => {
      mockTaskListService.createList.mockReturnValue(
        of({
          id: 1,
          title: 'New List',
          owner: 'johndoe',
          collaborators: [],
          tasks: [],
        })
      );

      component.listForm.patchValue({ title: 'New List' });
      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Failed Creation', () => {
    beforeEach(() => {
      component.open();
      fixture.detectChanges();
    });

    it('should display error message on failure', () => {
      mockTaskListService.createList.mockReturnValue(
        throwError(() => ({ error: { message: 'Title already exists' } }))
      );

      component.listForm.patchValue({ title: 'Duplicate Title' });
      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Title already exists');

      const errorBox = compiled.querySelector('.error-box');
      expect(errorBox).toBeTruthy();
      expect(errorBox!.textContent).toContain('Title already exists');
    });

    it('should handle array of error messages', () => {
      mockTaskListService.createList.mockReturnValue(
        throwError(() => ({ error: { message: ['Error 1', 'Error 2'] } }))
      );

      component.listForm.patchValue({ title: 'Test Title' });
      component.onSubmit();

      expect(component.errorMessage).toBe('Error 1, Error 2');
    });

    it('should display generic error message when error format is unexpected', () => {
      mockTaskListService.createList.mockReturnValue(throwError(() => ({ status: 500 })));

      component.listForm.patchValue({ title: 'Test Title' });
      component.onSubmit();

      expect(component.errorMessage).toBe('Failed to create list. Please try again.');
    });

    it('should reset loading state on error', () => {
      mockTaskListService.createList.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      component.listForm.patchValue({ title: 'Test Title' });
      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });

    it('should not close modal on error', () => {
      mockTaskListService.createList.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      component.listForm.patchValue({ title: 'Test Title' });
      component.onSubmit();

      expect(component.isOpen).toBe(true);
    });
  });
});
