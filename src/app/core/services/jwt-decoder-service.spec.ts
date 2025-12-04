import { TestBed } from '@angular/core/testing';

import { JwtDecoderService } from './jwt-decoder-service';

describe('JwtDecoderService', () => {
  let service: JwtDecoderService;

  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTczNTMyNDgwMCwiZXhwIjo5OTk5OTk5OTk5fQ.t8qY7X4aKZ2z5qB0mNlC6wVfJ9xH3eR4sT1pQ8uG7vI';

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

  describe('getUserFromToken', () => {
    it('should extract user information from valid token', () => {
      const username = service.getUsername(validToken);

      expect(username).toBe('testuser');
    });

    it('should return null for invalid token', () => {
      const username = service.getUsername('invalid.jwt.token');

      expect(username).toBeNull();
    });

    it('should return null for empty token', () => {
      const username = service.getUsername('');

      expect(username).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle token with special characters in username', () => {
      // Token with username "test@user.com"
      const specialToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHVzZXIuY29tIiwiaWF0IjoxNzM1MzI0ODAwLCJleHAiOjk5OTk5OTk5OTl9.xN8vK4pQ2sL1mW9tY6jH5oR3cZ7fA0bE9gU1dP4iV8r';

      const username = service.getUsername(specialToken);

      expect(username).toBe('test@user.com');
    });
  });
});
