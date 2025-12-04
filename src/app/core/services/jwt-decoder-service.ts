import { Injectable } from '@angular/core';

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface DecodeUser {
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
