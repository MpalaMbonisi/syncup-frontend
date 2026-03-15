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
  collaborators: string[] | null;
  tasks: TaskItemResponseDTO[] | null;
}

export interface TaskListCreateDTO {
  title: string;
}

export interface TaskListUpdateTitleDTO {
  title: string;
}

export interface TaskListDuplicateDTO {
  newTitle?: string;
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

  /**
   * Create a new task list
   */
  createList(dto: TaskListCreateDTO): Observable<TaskListResponseDTO> {
    return this.http.post<TaskListResponseDTO>(`${this.apiUrl}/create`, dto);
  }

  /**
   * Update task list title
   */
  updateListTitle(id: number, dto: TaskListUpdateTitleDTO): Observable<TaskListResponseDTO> {
    return this.http.patch<TaskListResponseDTO>(`${this.apiUrl}/${id}/title/update`, dto);
  }

  /**
   * Delete a task list
   */
  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Duplicate a task list
   * Creates a new list owned by the current user with all tasks from the original
   */
  duplicateList(id: number, dto: TaskListDuplicateDTO = {}): Observable<TaskListResponseDTO> {
    return this.http.post<TaskListResponseDTO>(`${this.apiUrl}/${id}/duplicate`, dto);
  }
}
