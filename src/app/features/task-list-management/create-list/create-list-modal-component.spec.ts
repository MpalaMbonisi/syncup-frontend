import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListModalComponent } from './create-list-modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListService } from '../../../core/services/task-list-service';

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
});
