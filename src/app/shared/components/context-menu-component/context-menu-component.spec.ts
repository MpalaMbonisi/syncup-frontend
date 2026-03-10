import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuComponent, MenuItem } from './context-menu-component';
import { By } from '@angular/platform-browser';

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

  describe('Menu Toggle', () => {
    it('should open menu when toggle is called', () => {
      component.toggle();
      expect(component.isOpen).toBe(true);
    });

    it('should close menu when toggle is called twice', () => {
      component.toggle();
      expect(component.isOpen).toBe(true);

      component.toggle();
      expect(component.isOpen).toBe(false);
    });

    it('should display menu when open', () => {
      component.toggle();
      fixture.detectChanges();

      const menu = fixture.nativeElement.querySelector('.menu-dropdown');
      expect(menu).toBeTruthy();
    });

    it('should emit opened event when menu opens', done => {
      component.opened.subscribe(() => {
        expect(component.isOpen).toBe(true);
        done();
      });

      component.toggle();
    });

    it('should emit closed event when menu closes', done => {
      component.isOpen = true;

      component.closed.subscribe(() => {
        expect(component.isOpen).toBe(false);
        done();
      });

      component.toggle();
    });
  });

  describe('Menu Button', () => {
    it('should render trigger button', () => {
      const button = fixture.nativeElement.querySelector('.menu-trigger');
      expect(button).toBeTruthy();
    });

    it('should have three dots icon', () => {
      const svg = fixture.nativeElement.querySelector('.menu-trigger svg');
      expect(svg).toBeTruthy();
    });

    it('should toggle menu when button is clicked', () => {
      const button = fixture.debugElement.query(By.css('.menu-trigger'));

      expect(component.isOpen).toBe(false);

      button.nativeElement.click();
      expect(component.isOpen).toBe(true);

      button.nativeElement.click();
      expect(component.isOpen).toBe(false);
    });

    it('should stop event propagation when clicked', () => {
      const event = new MouseEvent('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onTriggerClick(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Menu Items Display', () => {
    beforeEach(() => {
      component.toggle();
      fixture.detectChanges();
    });

    it('should display all visible menu items', () => {
      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBe(4);
    });

    it('should display menu item labels', () => {
      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems[0].textContent).toContain('View Details');
      expect(menuItems[1].textContent).toContain('Edit Title');
      expect(menuItems[2].textContent).toContain('Share List');
      expect(menuItems[3].textContent).toContain('Delete List');
    });

    it('should display menu item icons', () => {
      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item svg');
      expect(menuItems.length).toBe(4);
    });

    it('should apply danger class to danger items', () => {
      const deleteItem = fixture.nativeElement.querySelectorAll('.menu-item')[3];
      expect(deleteItem.classList.contains('danger')).toBe(true);
    });

    it('should apply disabled state to disabled items', () => {
      const shareItem = fixture.nativeElement.querySelectorAll('.menu-item')[2];
      expect(shareItem.classList.contains('disabled')).toBe(true);
    });
  });

  describe('Menu Item Actions', () => {
    beforeEach(() => {
      component.toggle();
      fixture.detectChanges();
    });

    it('should call action when menu item is clicked', () => {
      const menuItem = fixture.debugElement.queryAll(By.css('.menu-item'))[0];
      menuItem.nativeElement.click();

      expect(mockMenuItems[0].action).toHaveBeenCalled();
    });

    it('should emit itemClicked event with item id', done => {
      component.itemClicked.subscribe(id => {
        expect(id).toBe('view');
        done();
      });

      const menuItem = fixture.debugElement.queryAll(By.css('.menu-item'))[0];
      menuItem.nativeElement.click();
    });

    it('should close menu after item is clicked', () => {
      const menuItem = fixture.debugElement.queryAll(By.css('.menu-item'))[0];

      expect(component.isOpen).toBe(true);

      menuItem.nativeElement.click();

      expect(component.isOpen).toBe(false);
    });

    it('should not call action for disabled items', () => {
      const disabledItem = fixture.debugElement.queryAll(By.css('.menu-item'))[2];
      disabledItem.nativeElement.click();

      expect(mockMenuItems[2].action).not.toHaveBeenCalled();
    });

    it('should not close menu when disabled item is clicked', () => {
      const disabledItem = fixture.debugElement.queryAll(By.css('.menu-item'))[2];

      expect(component.isOpen).toBe(true);

      disabledItem.nativeElement.click();

      expect(component.isOpen).toBe(true);
    });

    it('should stop event propagation when item is clicked', () => {
      const event = new MouseEvent('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onItemClick(mockMenuItems[0], event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});
