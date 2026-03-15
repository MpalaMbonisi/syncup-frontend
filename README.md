# SyncUp Frontend

> A modern Angular web application for collaborative task management, connecting to the SyncUp REST API for seamless team productivity.

---

## Overview

SyncUp Frontend is the client-side application for the SyncUp collaborative task management platform. Built with Angular 20+ and following modern development practices, it provides an intuitive interface for managing task lists, collaborating with team members, and tracking task progress.

---

## Features

### Authentication
- Secure user registration with full name, username, email and password
- JWT-based login with token stored in `localStorage`
- Auth guard protecting all private routes
- HTTP interceptor that automatically attaches `Bearer` tokens to outgoing requests
- Auto-logout on token expiry or `401` responses

### Task List Management
- Create, rename, and delete task lists
- Duplicate any list — tasks are copied with completion status reset; collaborators are not carried over
- Grid and list view toggle with preference saved to `localStorage`
- Owner and collaborator badges on each list card
- Per-card progress bar showing completed vs total tasks

### Task Management
- Add tasks to any list with a simple inline input
- Toggle task completion with a checkbox — updates persisted immediately to the API
- Delete individual tasks with a confirmation prompt
- Empty state and live task count displayed at all times

### Collaborator Management
- List owners can add collaborators by username
- Collaborators are listed with the ability to remove them individually (owner only)
- Owners cannot be added as collaborators (validated client-side)
- Collaborating on a list grants read/write access without ownership privileges

### Account Settings
- View full account details (username, name, email) from the header settings panel
- Log out from any page via the settings modal
- Permanently delete account with a confirmation prompt

### Navigation & UX
- Responsive layout across desktop, tablet, and mobile
- Context menus per list card with role-aware actions (owners see edit, share, delete; collaborators do not)
- Back navigation from list detail view to dashboard
- Inline title editing directly on the list detail page
- Loading, error, and empty states handled consistently across all views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20+ with TypeScript |
| Styling | SCSS with Angular Material |
| State | RxJS with Angular Services |
| HTTP | Angular `HttpClient` |
| Testing | Jest 30, `jest-preset-angular` 16, Angular Testing Library |
| Linting | ESLint + Angular ESLint |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged + commitlint |

---

## 🔗 Backend Integration

- **API**: RESTful API — [SyncUp REST API](https://github.com/mpalambonisi/syncup-backend)
- **Auth**: JWT token authentication
- **Format**: JSON over HTTP
- **Base URL (dev)**: `http://localhost:8080`

The `apiUrl` is configured per environment in `src/environments/`:

```ts
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};
```

---

## CI/CD Pipeline Architecture

Our deployment pipeline follows modern DevOps practices with multiple quality gates:

```
Developer Workflow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Local Dev     │    │   Git Hooks      │    │   GitHub Actions    │
│                 │    │   (Husky)        │    │   Workflow          │
│ • Code Changes  ├────┤                  ├────┤                     │
│ • Local Testing │    │ • Pre-commit:    │    │ • Build & Test      │
│ • SCSS Styling  │    │   - ESLint       │    │ • Security Audit    │
│                 │    │   - Prettier     │    │ • Code Quality      │
└─────────────────┘    │ • Pre-push:      │    │                     │
                       │   - Unit Tests   │    │                     │
                       │   - Build Check  │    │                     │
                       └──────────────────┘    └─────────────────────┘
```

---

## Testing

### Test stack
- **Jest 30** as the test runner
- **jest-preset-angular 16** for Angular-specific Jest integration
- **Angular Testing Library** for component tests
- **`HttpTestingController`** for service-level HTTP tests

---

## Code Quality

### Git hooks (Husky)

| Hook | What it does |
|---|---|
| `pre-commit` | Runs ESLint + Prettier via lint-staged on staged files |
| `pre-push` | Runs full test suite and production build |
| `commit-msg` | Enforces Conventional Commits via commitlint |

### Commit convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add remember me option to login form
fix(tasks): correct toggle behaviour for completed tasks
chore(deps): bump angular to 20.3.18
```

Valid types: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` · `ci` · `build` · `revert`

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── constants/        # App-wide constants (routes, storage keys, API endpoints)
│   │   ├── guards/           # Auth guard
│   │   ├── interceptors/     # JWT auth interceptor
│   │   └── services/         # Auth, account, task list, task, collaborator, JWT, storage
│   ├── features/
│   │   ├── auth/             # Login and register components
│   │   ├── dashboard/        # Dashboard with task list cards
│   │   └── task-list-management/
│   │       ├── create-list/        # Create list modal
│   │       ├── duplicate-list/     # Duplicate list modal
│   │       ├── manage-collaborators/ # Collaborators modal
│   │       └── view-list/          # List detail + task management
│   └── shared/
│       └── components/
│           ├── context-menu-component/
│           ├── footer-component/
│           └── header-component/
├── environments/
└── styles/                   # Global SCSS variables and auth shared styles
```

---

## Security

Dependencies are monitored via `npm audit` as part of the CI pipeline. The workflow fails on any `high` or `critical` severity vulnerability.

```bash
# Check for vulnerabilities locally
npm audit
```