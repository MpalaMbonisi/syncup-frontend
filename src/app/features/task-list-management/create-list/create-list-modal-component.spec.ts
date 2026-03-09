import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListModalComponent } from './create-list-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListService } from '../../../core/services/task-list-service';

describe('CreateListModalComponent', () => {
  let component: CreateListModalComponent;
  let fixture: ComponentFixture<CreateListModalComponent>;
  let mockTaskListService: { createList: jest.Mock };
  // let compiled: HTMLElement;

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
    // compiled = fixture.nativeElement;
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
});
