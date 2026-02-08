import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponseDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/account`;
  private http: HttpClient = inject(HttpClient);

  /**
   * Get current user's account details
   */
  getAccountDetails(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.apiUrl}/details`);
  }

  /**
   * Delete current user's account
   */
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`);
  }
}
