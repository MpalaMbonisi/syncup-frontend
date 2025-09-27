## SyncUp Frontend

> A modern Angular web application for collaborative task management, connecting to the SyncUp REST API for seamless team productivity.

### 🌟 Overview

SyncUp Frontend is the client-side application for the SyncUp collaborative task management platform. Built with Angular 17+ and following modern development practices, it provides an intuitive interface for users to manage task lists, collaborate with team members, and track project progress in real-time.

#### Key Features (Planned)
- **User Authentication** - Secure login and registration with JWT tokens
- **Task Management** - Create, update, and organize tasks within lists
- **Team Collaboration** - Invite collaborators and manage shared task lists
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- **Modern UI/UX** - Clean, accessible interface with Angular Material components
- **Real-time Updates** - Live synchronization of task changes (future enhancement)

### 🏗️ Architecture & Tech Stack

#### Frontend Stack
- **Framework**: Angular 17+ with TypeScript
- **Styling**: SCSS with Angular Material
- **State Management**: RxJS with Angular Services
- **HTTP Client**: Angular HttpClient for API communication
- **Testing**: Jasmine, Karma, Angular Testing Library
- **Build Tool**: Angular CLI with Webpack

#### Backend Integration
- **API**: RESTful API hosted on AWS Lightsail
- **Authentication**: JWT-based token authentication
- **Data Format**: JSON over HTTPS
- **Base URL**: `http://3.71.52.212` (SyncUp API)

### 🚀 CI/CD Pipeline Architecture

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
└─────────────────┘    │ • Pre-push:      │    │ • Deploy to S3      │
                       │   - Unit Tests   │    │                     │
                       │   - Build Check  │    │                     │
                       └──────────────────┘    └─────────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │   AWS S3 Bucket     │
                                               │   Static Hosting    │
                                               │                     │
                                               │ • Angular Build     │
                                               │ • CloudFront CDN    │
                                               │ • Custom Domain     │
                                               └─────────────────────┘
```

#### Quality Gates
1. **Git Hooks** (Pre-commit/Pre-push)
   - Code linting and formatting
   - Unit test execution
   - Build verification

2. **GitHub Actions** (CI/CD)
   - Multi-Node.js version testing
   - Security vulnerability scanning
   - Production build creation
   - Automated deployment to AWS S3

3. **AWS Infrastructure**
   - S3 static website hosting
   - CloudFront CDN distribution (planned)
   - Route 53 custom domain (planned)

### 🌐 Deployment Strategy

#### Planned Infrastructure
- **Frontend**: AWS S3 + CloudFront + Route 53
- **Backend**: AWS Lightsail (already deployed)
- **Domain**: Custom domain with SSL certificate
- **Monitoring**: AWS CloudWatch integration

### 🔗 Repository Structure

This frontend repository is maintained separately from the [SyncUp API](https://github.com/yourusername/syncup-backend) following a **polyrepo** architecture approach, allowing for:
- Independent deployment cycles
- Technology-specific tooling
- Focused development teams
- Cleaner separation of concerns

### 👨‍💻 Author

**Mbonisi Mpala**
- LinkedIn: [Mbonisi Mpala](https://www.linkedin.com/in/mbonisi-mpala/)
- Backend API: [SyncUp REST API](https://github.com/mpalambonisi/syncup-backend)


