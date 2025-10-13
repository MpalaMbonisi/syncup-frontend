/**
 * Application-wide constants
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user_data',
} as const;

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASK_LISTS: '/task-lists',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  LISTS: {
    ALL: '/list/all',
    CREATE: '/list/create',
    BY_ID: (id: number) => `/list/${id}`,
    UPDATE_TITLE: (id: number) => `/list/${id}/title/update`,
    DELETE: (id: number) => `/list/${id}`,
  },
  COLLABORATORS: {
    ADD: (listId: number) => `/list/${listId}/collaborator/add`,
    ALL: (listId: number) => `/list/${listId}/collaborator/all`,
    REMOVE: (listId: number) => `/list/${listId}/collaborator/remove`,
  },
  TASKS: {
    CREATE: (listId: number) => `/list/${listId}/task/create`,
    BY_ID: (listId: number, taskId: number) => `/list/${listId}/task/${taskId}`,
    UPDATE_STATUS: (listId: number, taskId: number) => `/list/${listId}/task/${taskId}/status`,
    UPDATE_DESCRIPTION: (listId: number, taskId: number) =>
      `/list/${listId}/task/${taskId}/description`,
  },
} as const;

// HTTP Headers
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful! You can now log in.',
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  LIST_CREATED: 'Task list created successfully!',
  LIST_UPDATED: 'Task list updated successfully!',
  LIST_DELETED: 'Task list deleted successfully!',
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;
