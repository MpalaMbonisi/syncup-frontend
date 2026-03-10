import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuComponent, MenuItem } from './context-menu-component';

describe('ContextMenuComponent', () => {
  let component: ContextMenuComponent;
  let fixture: ComponentFixture<ContextMenuComponent>;

  const mockMenuItems: MenuItem[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: 'eye',
      action: jest.fn(),
    },
    {
      id: 'edit',
      label: 'Edit Title',
      icon: 'edit',
      action: jest.fn(),
      visible: true,
    },
    {
      id: 'share',
      label: 'Share List',
      icon: 'share',
      action: jest.fn(),
      disabled: true,
    },
    {
      id: 'delete',
      label: 'Delete List',
      icon: 'trash',
      action: jest.fn(),
      danger: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with menu closed', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should not display menu when closed', () => {
      const menu = fixture.nativeElement.querySelector('.menu-dropdown');
      expect(menu).toBeNull();
    });
  });
});
