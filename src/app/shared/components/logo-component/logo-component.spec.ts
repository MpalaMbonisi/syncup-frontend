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
});
