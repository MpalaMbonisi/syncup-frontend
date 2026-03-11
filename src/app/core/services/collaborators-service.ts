import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AddCollaboratorsDTO {
  collaborators: string[];
}

export interface RemoveCollaboratorDTO {
  username: string;
}

export interface CollaboratorResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CollaboratorsService {
  private apiUrl = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  /**
   * Get all collaborators for a list
   */
  getAllCollaborators(listId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list/${listId}/collaborator/all`);
  }

  /**
   * Add collaborators to a list
   */
  addCollaborators(listId: number, dto: AddCollaboratorsDTO): Observable<CollaboratorResponse> {
    return this.http.post<CollaboratorResponse>(
      `${this.apiUrl}/list/${listId}/collaborator/add`,
      dto
    );
  }

  /**
   * Remove a collaborator from a list
   */
  removeCollaborator(listId: number, dto: RemoveCollaboratorDTO): Observable<CollaboratorResponse> {
    return this.http.delete<CollaboratorResponse>(
      `${this.apiUrl}/list/${listId}/collaborator/remove`,
      { body: dto }
    );
  }
}
