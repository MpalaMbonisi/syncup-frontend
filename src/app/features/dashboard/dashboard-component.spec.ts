import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { provideRouter, Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { TaskListService } from '../../core/services/task-list-service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let jwtDecoder: jasmine.SpyObj<JwtDecoderService>;
  let taskListService: jasmine.SpyObj<TaskListService>;

  const mockValidUser = {
    username: 'johndoe',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    isExpired: false,
  };

  const mockExpiredUser = {
    username: 'johndoe',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    isExpired: true,
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const jwtDecoderSpy = jasmine.createSpyObj('JwtDecoderService', ['getUserFromToken']);
    const taskListServiceSpy = jasmine.createSpyObj('TaskListService', ['getAllLists']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: JwtDecoderService, useValue: jwtDecoderSpy },
        { provide: TaskListService, useValue: taskListServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    jwtDecoder = TestBed.inject(JwtDecoderService) as jasmine.SpyObj<JwtDecoderService>;
    taskListService = TestBed.inject(TaskListService) as jasmine.SpyObj<TaskListService>;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    taskListService.getAllLists.and.returnValue(of([]));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('User Authentication', () => {
    it('should load user info from token on init', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('mock-token-12345');
      expect(component.username).toBe('Johndoe');
    });

    it('should capitalize first letter of username', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.username).toBe('Johndoe');
    });

    it('should redirect to login if no token exists', () => {
      jwtDecoder.getUserFromToken.and.returnValue(null);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token cannot be decoded', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'invalid-token');
      jwtDecoder.getUserFromToken.and.returnValue(null);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('invalid-token');
      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token is expired', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'expired-token');
      jwtDecoder.getUserFromToken.and.returnValue(mockExpiredUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isTokenExpired).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should store user data in localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      spyOn(localStorage, 'setItem');

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        jasmine.any(String)
      );
    });
  });
});
