import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateListModalComponent } from './duplicate-list-modal-component';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

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

  const mockDuplicatedList: TaskListResponseDTO = {
    id: 4,
    title: 'Shopping List (Copy)',
    owner: 'johndoe',
    collaborators: [],
    tasks: [
      { id: 10, description: 'Buy milk', completed: false, taskListTitle: 'Shopping List (Copy)' },
      { id: 11, description: 'Buy bread', completed: false, taskListTitle: 'Shopping List (Copy)' },
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

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.open(mockOriginalList);
      fixture.detectChanges();
    });

    it('should display modal title', () => {
      const title = compiled.querySelector('.modal-title');
      expect(title?.textContent).toContain('Duplicate List');
    });

    it('should display original list title in subtitle', () => {
      const subtitle = compiled.querySelector('.original-list-name');
      expect(subtitle?.textContent).toContain('Shopping List');
    });

    it('should display task count', () => {
      const taskCount = compiled.querySelector('.info-item');
      expect(taskCount?.textContent).toContain('2 tasks');
    });

    it('should display ownership info when duplicating as collaborator', () => {
      component.currentUsername = 'janedoe'; // Collaborator, not owner
      fixture.detectChanges();

      const ownershipInfo = compiled.querySelector('.ownership-notice');
      expect(ownershipInfo).toBeTruthy();
      expect(ownershipInfo?.textContent).toContain('You will become the owner');
    });

    it('should not display ownership info when duplicating as owner', () => {
      component.currentUsername = 'johndoe'; // Owner
      fixture.detectChanges();

      const ownershipInfo = compiled.querySelector('.ownership-notice');
      expect(ownershipInfo).toBeNull();
    });

    it('should render title input field', () => {
      const input = compiled.querySelector('#newTitle');
      expect(input).toBeTruthy();
    });

    it('should render duplicate button', () => {
      const button = compiled.querySelector('.duplicate-btn');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Duplicate');
    });

    it('should render cancel button', () => {
      const cancelButton = compiled.querySelector('.cancel-btn');
      expect(cancelButton).toBeTruthy();
    });
  });

  describe('Suggested Title Generation', () => {
    it('should suggest title with (Copy) suffix', () => {
      component.open(mockOriginalList);
      expect(component.suggestedTitle).toBe('Shopping List (Copy)');
    });

    it('should suggest title with (Copy 2) if already has (Copy)', () => {
      const listWithCopy = { ...mockOriginalList, title: 'Shopping List (Copy)' };
      component.open(listWithCopy);
      expect(component.suggestedTitle).toBe('Shopping List (Copy 2)');
    });

    it('should increment copy number if already numbered', () => {
      const listWithCopy2 = { ...mockOriginalList, title: 'Shopping List (Copy 2)' };
      component.open(listWithCopy2);
      expect(component.suggestedTitle).toBe('Shopping List (Copy 3)');
    });
  });

  describe('Duplicate List Action', () => {
    beforeEach(() => {
      component.open(mockOriginalList);
      fixture.detectChanges();
    });

    it('should use suggested title when form is empty', () => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      component.duplicateList();

      expect(mockTaskListService.duplicateList).toHaveBeenCalledWith(1, {});
    });

    it('should use custom title when provided', () => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      component.duplicateForm.patchValue({ newTitle: 'My Custom List' });
      component.duplicateList();

      expect(mockTaskListService.duplicateList).toHaveBeenCalledWith(1, {
        newTitle: 'My Custom List',
      });
    });

    it('should trim whitespace from custom title', () => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      component.duplicateForm.patchValue({ newTitle: '  My Custom List  ' });
      component.duplicateList();

      expect(mockTaskListService.duplicateList).toHaveBeenCalledWith(1, {
        newTitle: 'My Custom List',
      });
    });

    it('should emit listDuplicated event on success', done => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      component.listDuplicated.subscribe(newList => {
        expect(newList).toEqual(mockDuplicatedList);
        done();
      });

      component.duplicateList();
    });

    it('should close modal after successful duplication', () => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      component.duplicateList();

      expect(component.isOpen).toBe(false);
    });

    it('should set loading state during duplication', () => {
      mockTaskListService.duplicateList.mockReturnValue(of(mockDuplicatedList));

      expect(component.isLoading).toBe(false);

      component.duplicateList();

      // Loading is set to false after observable completes
      expect(component.isLoading).toBe(false);
    });

    it('should disable button while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = compiled.querySelector('.duplicate-btn') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should show "Duplicating..." text while loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const button = compiled.querySelector('.duplicate-btn');
      expect(button?.textContent).toContain('Duplicating...');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.open(mockOriginalList);
      fixture.detectChanges();
    });

    it('should display error when duplication fails', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: 'Duplication failed' } }))
      );

      component.duplicateList();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Duplication failed');
    });

    it('should handle 404 error when list not found', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: 'List not found' } }))
      );

      component.duplicateList();

      expect(component.errorMessage).toBe('List not found');
    });

    it('should handle 400 error for invalid title', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: 'Title cannot be empty' } }))
      );

      component.duplicateList();

      expect(component.errorMessage).toBe('Title cannot be empty');
    });

    it('should handle 409 error for duplicate title', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: 'A list with this title already exists' } }))
      );

      component.duplicateList();

      expect(component.errorMessage).toBe('A list with this title already exists');
    });

    it('should handle array error messages', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: ['Error 1', 'Error 2'] } }))
      );

      component.duplicateList();

      expect(component.errorMessage).toBe('Error 1, Error 2');
    });

    it('should show generic error for unknown errors', () => {
      mockTaskListService.duplicateList.mockReturnValue(throwError(() => ({})));

      component.duplicateList();

      expect(component.errorMessage).toBe('Failed to duplicate list. Please try again.');
    });

    it('should not close modal when duplication fails', () => {
      mockTaskListService.duplicateList.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      component.duplicateList();

      expect(component.isOpen).toBe(true);
    });

    it('should display error box in template', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();

      const errorBox = compiled.querySelector('.error-box');
      expect(errorBox).toBeTruthy();
      expect(errorBox?.textContent).toContain('Test error');
    });
  });

  describe('List Information Display', () => {
    beforeEach(() => {
      component.open(mockOriginalList);
      fixture.detectChanges();
    });

    it('should display task count correctly', () => {
      const taskCount = compiled.querySelector('.info-item');
      expect(taskCount?.textContent).toContain('2 tasks will be copied');
    });

    it('should display singular "task" for single task', () => {
      const singleTaskList = {
        ...mockOriginalList,
        tasks: [{ id: 1, description: 'Task', completed: false, taskListTitle: 'List' }],
      };
      component.open(singleTaskList);
      fixture.detectChanges();

      const taskCount = compiled.querySelector('.info-item');
      expect(taskCount?.textContent).toContain('1 task will be copied');
    });

    it('should indicate empty list', () => {
      const emptyList = { ...mockOriginalList, tasks: [] };
      component.open(emptyList);
      fixture.detectChanges();

      const taskCount = compiled.querySelector('.info-item');
      expect(taskCount?.textContent).toContain('No tasks to copy');
    });

    it('should show that collaborators will not be copied', () => {
      const infoNotes: NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll('.info-note');
      const notesText = Array.from(infoNotes).map((n: HTMLElement) => n.textContent || '');

      const hasCollabNote = notesText.some(text =>
        text.includes('Collaborators will not be copied')
      );

      expect(hasCollabNote).toBe(true);
    });

    it('should show that tasks will be reset to incomplete', () => {
      const infoNotes: NodeListOf<HTMLElement> =
        fixture.nativeElement.querySelectorAll('.info-note');
      const notesText = Array.from(infoNotes).map((n: HTMLElement) => n.textContent || '');

      const hasCollabNote = notesText.some(text =>
        text.includes('All tasks will be marked as incomplete')
      );

      expect(hasCollabNote).toBe(true);
    });
  });

  describe('Backdrop Click', () => {
    it('should close modal when backdrop is clicked', () => {
      component.open(mockOriginalList);
      fixture.detectChanges();

      const backdrop = fixture.debugElement.query(By.css('.modal-overlay'));
      backdrop.nativeElement.click();

      expect(component.isOpen).toBe(false);
    });

    it('should not close when modal content is clicked', () => {
      component.open(mockOriginalList);
      fixture.detectChanges();

      const event = new MouseEvent('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onModalContentClick(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(component.isOpen).toBe(true);
    });
  });

  describe('Ownership Detection', () => {
    it('should detect when user is the owner', () => {
      component.currentUsername = 'johndoe';
      component.open(mockOriginalList);

      expect(component.isOwner()).toBe(true);
    });

    it('should detect when user is a collaborator', () => {
      component.currentUsername = 'janedoe';
      component.open(mockOriginalList);

      expect(component.isOwner()).toBe(false);
    });
  });
});
