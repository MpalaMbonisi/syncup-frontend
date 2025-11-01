import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoComponent } from './logo-component';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Structure', () => {
    it('should render logo container', () => {
      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer).toBeTruthy();
    });

    it('should render logo svg', () => {
      const logo = compiled.querySelector('.logo');
      expect(logo).toBeTruthy();
    });

    it('should render logo text', () => {
      const logoText = compiled.querySelector('.logo-text');
      expect(logoText).toBeTruthy();
      expect(logoText?.textContent).toBe('SyncUp');
    });
    it('should have correct svg viewBox', () => {
      // The viewBox attribute defines the position and dimension, in user space, of an SVG viewport.
      const svg = compiled.querySelector('svg');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
    });
  });

  describe('SVG Elements', () => {
    it('should render circular background', () => {
      const circle = compiled.querySelector('circle');
      expect(circle).toBeTruthy();
      expect(circle?.getAttribute('cx')).toBe('50');
      expect(circle?.getAttribute('cy')).toBe('50');
      expect(circle?.getAttribute('r')).toBe('48');
    });

    it('should render sync arrows', () => {
      const paths = compiled.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(3);
    });

    it('should have correct circle fill color', () => {
      const circle = compiled.querySelector('circle');
      expect(circle?.getAttribute('fill')).toBe('#4f46e5');
    });

    it('should have white stroke colour for arrows', () => {
      const paths = compiled.querySelectorAll('path');
      paths.forEach(path => {
        expect(path.getAttribute('stroke')).toBe('white');
      });
    });
  });

  describe('Size Classes', () => {
    it('should not have size class when medium (default)', () => {
      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('small')).toBeFalse();
      expect(logoContainer?.classList.contains('large')).toBeFalse();
    });

    it('should add small class when size is small', () => {
      component.size = 'small';
      fixture.detectChanges();

      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('small')).toBeTrue();
    });

    it('should add large class when size is large', () => {
      component.size = 'large';
      fixture.detectChanges();

      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('large')).toBeTrue();
    });

    it('should remove small class when size changes from small to medium', () => {
      component.size = 'small';
      fixture.detectChanges();
      let logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('small')).toBeTrue();

      component.size = 'medium';
      fixture.detectChanges();
      logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('small')).toBeFalse();
    });

    it('should remove large class when size changes from large to medium', () => {
      component.size = 'large';
      fixture.detectChanges();
      let logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('large')).toBeTrue();

      component.size = 'medium';
      fixture.detectChanges();
      logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer?.classList.contains('large')).toBeFalse();
    });
  });

  describe('Styling', () => {
    it('should have flex display for logo container', () => {
      const logoContainer = compiled.querySelector('.logo-container') as HTMLElement;
      const styles = window.getComputedStyle(logoContainer);
      expect(styles.display).toBe('flex');
    });

    it('should center align items in logo container', () => {
      const logoContainer = compiled.querySelector('.logo-container') as HTMLElement;
      const styles = window.getComputedStyle(logoContainer);
      expect(styles.alignItems).toBe('center');
    });

    it('should have column flex direction for logo container', () => {
      const logoContainer = compiled.querySelector('.logo-container') as HTMLElement;
      const styles = window.getComputedStyle(logoContainer);
      expect(styles.flexDirection).toBe('column');
    });
  });

  describe('Visual Regression Guards', () => {
    it('should maintain logo container structure', () => {
      const logoContainer = compiled.querySelector('.logo-container');
      const logo = logoContainer?.querySelector('.logo');
      const logoText = logoContainer?.querySelector('.logo-text');

      expect(logo).toBeTruthy();
      expect(logoText).toBeTruthy();
    });

    it('should maintain SVG structure', () => {
      const svg = compiled.querySelector('svg');
      const circle = svg?.querySelector('circle');
      const paths = svg?.querySelectorAll('path');

      expect(circle).toBeTruthy();
      expect(paths?.length).toBeGreaterThan(0);
    });

    it('should have correct logo text content', () => {
      const logoText = compiled.querySelector('.logo-text');
      expect(logoText?.textContent?.trim()).toBe('SyncUp');
    });
  });
});
