import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItemResponseDTO {
  id: number;
  description: string;
  completed: boolean;
  taskListTitle: string;
}

export interface TaskListResponseDTO {
  id: number;
  title: string;
  owner: string;
  collaborators: string[];
  tasks: TaskItemResponseDTO[];
}

export interface TaskListCreateDTO {
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskListService {
  private apiUrl = `${environment.apiUrl}/list`;
  private http: HttpClient = inject(HttpClient);

  /**
   * Get all task lists for the current user (owned + collaborated)
   */
  getAllLists(): Observable<TaskListResponseDTO[]> {
    return this.http.get<TaskListResponseDTO[]>(`${this.apiUrl}/all`);
  }

  /**
   * Get a specific task list by ID
   */
  getListById(id: number): Observable<TaskListResponseDTO> {
    return this.http.get<TaskListResponseDTO>(`${this.apiUrl}/${id}`);
  }
}
