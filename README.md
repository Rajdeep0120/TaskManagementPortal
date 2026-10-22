# Task & Team Management Portal

A full-stack, enterprise-ready web application for managing projects, team workloads, and task lifecycles across interactive Kanban boards.

Built with **.NET 8 Web API**, **PostgreSQL**, and **React 18 + TypeScript (Vite)**.

---

## 🚀 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend** | .NET 8 (C# 12) | Clean layered architecture (`Controllers` → `Services` → `Repositories`) |
| **Database** | PostgreSQL 16 | Relational store with foreign keys, composite indexes, cascades |
| **ORM** | EF Core 8 (Npgsql) | Code-first migrations & relational mapping |
| **Micro-ORM** | Dapper 2.1 | Raw SQL reporting query with conditional status aggregations |
| **Authentication** | JWT Bearer | Role-Based Access Control (`Admin`, `Member`) & BCrypt hashing |
| **Validation** | FluentValidation | Auto-validation pipeline on DTOs |
| **API Documentation** | Swagger / OpenAPI | Interactive UI with JWT Bearer auth support |
| **Unit Testing** | xUnit, Moq, FluentAssertions | 18 service layer unit tests |
| **Frontend** | React 18 + TypeScript | Scaffolded with Vite |
| **Routing & Auth** | React Router DOM v7 | Role-based protected routes & session restoration |
| **Form Management** | React Hook Form + Zod | Schema-based validation with live error feedback |
| **HTTP Client** | Axios | Configured with JWT interceptors & auto 401 handling |
| **Containerization** | Docker & Docker Compose | Multi-stage builds for API, UI (Nginx), and PostgreSQL |
| **CI/CD** | GitHub Actions | Automated build and test pipeline for backend & frontend |

---

## 🏛️ Architecture & Clean Layering

```
TaskManagementPortal/
├── TaskManagement.Domain/               # Pure domain layer (no external dependencies)
│   ├── Entities/                        # User, Project, TaskItem, ProjectMember, TaskComment
│   ├── Enums/                           # TaskItemStatus, TaskPriority, UserRole
│   └── Interfaces/                      # Repository interfaces
│
├── TaskManagement.Application/          # Business logic & use cases
│   ├── DTOs/                            # Typed request/response models
│   ├── Interfaces/                      # Service interfaces (IAuthService, IProjectService, etc.)
│   ├── Services/                        # Business logic implementations
│   ├── Validators/                      # FluentValidation classes (Zod-equivalent in backend)
│   └── Mappings/                        # Type-safe extension mappings
│
├── TaskManagement.Infrastructure/       # Data persistence & external services
│   ├── Data/                            # AppDbContext (EF Core Fluent API configs & indexes)
│   ├── Repositories/                    # EF Core repository implementations
│   ├── Reports/                         # DapperReportRepository (Raw SQL query)
│   └── Seed/                            # Automatic DB seeder on startup
│
├── TaskManagement.Api/                  # Presentation layer
│   ├── Controllers/                     # REST API controllers with Swagger annotations
│   ├── Middleware/                      # Global exception handling middleware
│   └── Program.cs                       # DI composition root & middleware pipeline
│
├── TaskManagement.Tests/                # Automated testing
│   └── Services/                        # xUnit + Moq + FluentAssertions service tests
│
└── taskmanagement-ui/                   # React + TypeScript Frontend
    ├── src/
    │   ├── api/                         # Typed Axios API clients
    │   ├── components/                  # Navbar, Modals, Kanban components
    │   ├── context/                     # AuthContext (JWT & user state)
    │   ├── pages/                       # Login, Dashboard, Projects, Board, Reports
    │   └── types/                       # Shared TypeScript definitions
    └── Dockerfile & nginx.conf          # Production container setup
```

---

## 🔑 Pre-Seeded Demo Credentials

The database automatically seeds sample users, projects, tasks, and comments on initial startup:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@taskmanager.com` | `Admin@123` | Full access: CRUD on projects, tasks, comments, and **Reports** |
| **Member** | `john@taskmanager.com` | `Member@123` | View projects, manage tasks, add/delete own comments |

> **Pro Tip:** On the login page, you can click the **"Admin User"** or **"John (Member)"** quick-fill buttons to test without typing.

---

## 🛠️ How to Run Locally

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js v18+](https://nodejs.org/) & `npm`
- [Docker Desktop](https://www.docker.com/) (running for PostgreSQL)

---

### Step 1: Start PostgreSQL via Docker
```bash
docker compose up -d postgres
```
This spins up PostgreSQL on port `5432` with database `taskmanagement_db`.

---

### Step 2: Run the Backend (.NET 8 Web API)
```bash
cd TaskManagement.Api
dotnet run
```
- API will start at: `http://localhost:5000`
- Swagger UI Documentation: **`http://localhost:5000/swagger`**
- The database migrations and seed data are automatically applied on startup!

---

### Step 3: Run the Frontend (React + TypeScript)
In a new terminal window:
```bash
cd taskmanagement-ui
npm install --legacy-peer-deps
npm run dev
```
- React App will open at: **`http://localhost:5173`** (or the port displayed in the console).

---

## 🐳 Running Everything with Docker Compose

To run the entire stack (PostgreSQL + .NET 8 API + React UI with Nginx) inside Docker:

```bash
docker compose up --build
```

Access the services:
- **Frontend App:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`
- **PostgreSQL:** `localhost:5432`

To stop:
```bash
docker compose down
```

---

## 🧪 Running Unit Tests

Run the 18 service layer unit tests with xUnit:

```bash
dotnet test TaskManagement.Tests/TaskManagement.Tests.csproj
```

**Test Coverage Highlights:**
- `AuthServiceTests`: Login with valid/invalid credentials, password hashing check, token claim generation, duplicate email check.
- `ProjectServiceTests`: CRUD operations, non-existent entity checks with custom exceptions.
- `TaskServiceTests`: Creation with foreign key project check, status updates, priority mappings.
- `TaskCommentServiceTests`: Adding comments, deleting own comments, blocking deletion of comments created by other users.

---

## 📊 Database Schema & Dapper Report

### ER Model
- **Users**: `Id`, `FullName`, `Email` (unique), `PasswordHash`, `Role`, `CreatedAt`
- **Projects**: `Id`, `Name`, `Description`, `CreatedByUserId` (FK), `CreatedAt`, `UpdatedAt`
- **ProjectMembers**: `ProjectId` (FK), `UserId` (FK), `JoinedAt` (Composite Primary Key)
- **Tasks**: `Id`, `Title`, `Description`, `Status`, `Priority`, `DueDate`, `ProjectId` (FK), `AssignedToUserId` (FK), `CreatedByUserId` (FK)
- **TaskComments**: `Id`, `Content`, `TaskId` (FK), `UserId` (FK), `CreatedAt`

### Dapper Raw SQL Query (`ReportsController`)
Located in `TaskManagement.Infrastructure/Reports/DapperReportRepository.cs`:
```sql
SELECT 
    u."Id" AS UserId,
    u."FullName",
    u."Email",
    COUNT(CASE WHEN t."Status" = 0 THEN 1 END) AS ToDoCount,
    COUNT(CASE WHEN t."Status" = 1 THEN 1 END) AS InProgressCount,
    COUNT(CASE WHEN t."Status" = 2 THEN 1 END) AS DoneCount,
    COUNT(t."Id") AS TotalCount
FROM "Users" u
LEFT JOIN "Tasks" t ON u."Id" = t."AssignedToUserId"
GROUP BY u."Id", u."FullName", u."Email"
ORDER BY COUNT(t."Id") DESC;
```

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `GET` | `/api/dashboard/summary` | Authenticated | Task counts grouped by status |
| `GET` | `/api/projects` | Authenticated | List all projects (paginated) |
| `GET` | `/api/projects/{id}` | Authenticated | Get project details |
| `POST` | `/api/projects` | **Admin** | Create new project |
| `PUT` | `/api/projects/{id}` | **Admin** | Update project |
| `DELETE` | `/api/projects/{id}` | **Admin** | Delete project |
| `GET` | `/api/projects/{id}/members` | Authenticated | List members of project |
| `POST` | `/api/projects/{id}/members` | **Admin** | Add member to project |
| `DELETE` | `/api/projects/{id}/members/{userId}` | **Admin** | Remove member from project |
| `GET` | `/api/tasks` | Authenticated | Filtered/sorted/paginated tasks |
| `GET` | `/api/tasks/{id}` | Authenticated | Get task by ID |
| `POST` | `/api/tasks` | Authenticated | Create task |
| `PUT` | `/api/tasks/{id}` | Authenticated | Update task |
| `PATCH` | `/api/tasks/{id}/status` | Authenticated | Update status only (Kanban shift) |
| `DELETE` | `/api/tasks/{id}` | **Admin** | Delete task |
| `GET` | `/api/tasks/{id}/comments` | Authenticated | List task comments |
| `POST` | `/api/tasks/{id}/comments` | Authenticated | Post comment on task |
| `DELETE` | `/api/tasks/{id}/comments/{commentId}` | Authenticated | Delete own comment |
| `GET` | `/api/reports/tasks-per-user` | **Admin** | Dapper raw SQL workload report |
