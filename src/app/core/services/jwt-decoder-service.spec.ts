import { TestBed } from '@angular/core/testing';

import { JwtDecoderService } from './jwt-decoder-service';

describe('JwtDecoderService', () => {
  let service: JwtDecoderService;

  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTczNTMyNDgwMCwiZXhwIjo5OTk5OTk5OTk5fQ.t8qY7X4aKZ2z5qB0mNlC6wVfJ9xH3eR4sT1pQ8uG7vI';

  // const expiredToken =
  //  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTczNTMyNDgwMCwiZXhwIjoxNzM1MzI4NDAwfQ.9L5fZ7K2xW1qR4tY8vN3mP6jS0cH9gU2bA7dE5iO3fT';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtDecoderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const payload = service.decodeToken(validToken);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('testuser');
      expect(payload?.iat).toBe(1735324800);
      expect(payload?.exp).toBe(9999999999);
    });

    it('should return null for invalid token structure', () => {
      const invalidToken = 'invalid.jwt.token';
      const payload = service.decodeToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const payload = service.decodeToken(malformedToken);

      expect(payload).toBeNull();
    });
  });
});
