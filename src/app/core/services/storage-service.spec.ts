// src/app/core/services/storage.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage-service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Clear storage before each test just to be safe
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call localStorage.setItem with the correct arguments', () => {
    // Spy directly on the global localStorage object
    const setItemSpy = jest.spyOn(window.localStorage, 'setItem');

    service.setItem('testKey', 'testValue');
    expect(setItemSpy).toHaveBeenCalledWith('testKey', 'testValue');
  });

  it('should call localStorage.getItem with the correct key', () => {
    const getItemSpy = jest.spyOn(window.localStorage, 'getItem').mockReturnValue('testValue');

    const result = service.getItem('testKey');

    expect(getItemSpy).toHaveBeenCalledWith('testKey');
    expect(result).toBe('testValue');
  });

  it('should call localStorage.removeItem with the correct key', () => {
    const removeItemSpy = jest.spyOn(window.localStorage, 'removeItem');

    service.removeItem('testKey');
    expect(removeItemSpy).toHaveBeenCalledWith('testKey');
  });

  it('should call localStorage.clear', () => {
    const clearSpy = jest.spyOn(window.localStorage, 'clear');

    service.clear();
    expect(clearSpy).toHaveBeenCalled();
  });
});
