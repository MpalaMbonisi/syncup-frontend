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
});
