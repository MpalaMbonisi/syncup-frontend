import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer-component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should render footer text with year', () => {
    const compiled = fixture.nativeElement;
    const footerText = compiled.querySelector('.footer-text');

    expect(footerText).toBeTruthy();
    expect(footerText.textContent).toContain(component.currentYear.toString());
  });

  it('should display copyright symbol', () => {
    const compiled = fixture.nativeElement;
    const footerText = compiled.querySelector('.footer-text');

    expect(footerText.textContent).toContain('©');
  });

  it('should display Syncup text', () => {
    const compiled = fixture.nativeElement;
    const footerText = compiled.querySelector('.footer-text');

    expect(footerText.textContent).toContain('Syncup');
  });

  it('should display author name', () => {
    const compiled = fixture.nativeElement;
    const authorLink = compiled.querySelector('a');

    expect(authorLink).toBeTruthy();
    expect(authorLink.textContent).toContain('Mbonisi Mpala');
  });

  it('should have correct LinkedIn link', () => {
    const compiled = fixture.nativeElement;
    const authorLink = compiled.querySelector('a');

    expect(authorLink.getAttribute('href')).toBe('https://www.linkedin.com/in/mbonisi-mpala/');
  });

  it('should open link in new tab', () => {
    const compiled = fixture.nativeElement;
    const authorLink = compiled.querySelector('a');

    expect(authorLink.getAttribute('target')).toBe('_blank');
  });

  it('should have rel="noopener noreferrer" for security', () => {
    const compiled = fixture.nativeElement;
    const authorLink = compiled.querySelector('a');

    expect(authorLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should display heart emoji', () => {
    const compiled = fixture.nativeElement;
    const heart = compiled.querySelector('.heart');

    expect(heart).toBeTruthy();
    expect(heart.textContent).toContain('❤️');
  });

  it('should have footer element', () => {
    const compiled = fixture.nativeElement;
    const footer = compiled.querySelector('footer');

    expect(footer).toBeTruthy();
  });

  it('should have footer class', () => {
    const compiled = fixture.nativeElement;
    const footer = compiled.querySelector('footer');

    expect(footer.classList.contains('footer')).toBe(true);
  });
});
