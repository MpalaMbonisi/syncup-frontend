import { Injectable } from '@angular/core';

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface DecodedUser {
  username: string;
  issuedAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class JwtDecoderService {
  /**
   * Decodes a JWT token and returns the payload
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');

      if (parts.length !== 3) {
        console.error('Invalid JWT token structure');
        return null;
      }

      // Decode the payload
      const payload = parts[1];
      const decodedPayload = this.base64URLDecode(payload);

      return JSON.parse(decodedPayload) as JwtPayload;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Extracts user information from JWT token
   * @param token - JWT token string
   * @returns User information or null if invalid
   */
  getUserFromToken(token: string): DecodedUser | null {
    const payload = this.decodeToken(token);

    if (!payload) {
      return null;
    }

    return {
      username: payload.sub,
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
      isExpired: this.isTokenExpired(payload.exp),
    };
  }

  /**
   * Checks if a token is expired
   * @param token - JWT token string
   * @returns true if expired, false otherwise
   */
  isTokenExpired(expOrToken: number | string): boolean {
    try {
      let exp: number;

      if (typeof expOrToken === 'string') {
        const payload = this.decodeToken(expOrToken);
        if (!payload) return true;
        exp = payload.exp;
      } else {
        exp = expOrToken;
      }

      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      return exp < now;
    } catch (error) {
      console.error('Error checking token expiration: ', error);
      return true; // Treat errors as expired
    }
  }

  /**
   * Get the username from a token
   * @param token - JWT token string
   * @returns Username or nul if invalid
   */
  getUsername(token: string): string | null {
    const user = this.getUserFromToken(token);
    return user ? user.username : null;
  }

  /**
   * Decodes a base64url encoded string
   * @param str - Base64url encoded string
   * @returns Decoded string
   */
  private base64URLDecode(str: string): string {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' to make length multiple of 4
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode base64
    const decoded = atob(base64);

    // Handle UTF-8 encoding
    return decodeURIComponent(
      decoded
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }
}
