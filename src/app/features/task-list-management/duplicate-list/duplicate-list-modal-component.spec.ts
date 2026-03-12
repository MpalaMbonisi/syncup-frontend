import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateListModalComponent } from './duplicate-list-modal-component';
import { TaskListService } from '../../../core/services/task-list-service';

describe('DuplicateListModalComponent', () => {
  let component: DuplicateListModalComponent;
  let fixture: ComponentFixture<DuplicateListModalComponent>;
  let mockTaskListService: {
    duplicateList: jest.Mock;
  };
  // let compiled: HTMLElement;

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
    // compiled = fixture.nativeElement;
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
});
