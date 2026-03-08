import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TaskItemResponseDTO } from './task-list-service';
import { Observable } from 'rxjs';

export interface TaskCreateDTO {
  description: string;
}

export interface TaskUpdateStatusDTO {
  completed: boolean;
}

export interface TaskUpdateDescriptionDTO {
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  /**
   * Create a new task in a list
   */
  createTask(listId: number, dto: TaskCreateDTO): Observable<TaskItemResponseDTO> {
    return this.http.post<TaskItemResponseDTO>(`${this.apiUrl}/list/${listId}/task/create`, dto);
  }

  /**
   * Get a specific task by ID
   */
  getTaskById(listId: number, taskId: number): Observable<TaskItemResponseDTO> {
    return this.http.get<TaskItemResponseDTO>(`${this.apiUrl}/list/${listId}/task/${taskId}`);
  }

  /**
   * Update task status (completed/incomplete)
   */
  updateTaskStatus(
    listId: number,
    taskId: number,
    dto: TaskUpdateStatusDTO
  ): Observable<TaskItemResponseDTO> {
    return this.http.patch<TaskItemResponseDTO>(
      `${this.apiUrl}/list/${listId}/task/${taskId}/status`,
      dto
    );
  }

  /**
   * Update task description
   */
  updateTaskDescription(
    listId: number,
    taskId: number,
    dto: TaskUpdateDescriptionDTO
  ): Observable<TaskItemResponseDTO> {
    return this.http.patch<TaskItemResponseDTO>(
      `${this.apiUrl}/list/${listId}/task/${taskId}/description`,
      dto
    );
  }

  /**
   * Delete a task
   */
  deleteTask(listId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/list/${listId}/task/${taskId}`);
  }
}
