# PROJECT MASTER CONTEXT
# REGISTER ARSIP SURAT

## 1. PROJECT OVERVIEW

Project name: Register Arsip Surat

Application type: Web-based Incoming Mail Archive Management System.

Primary domain: `arsipku.hivan.my.id`

The application is designed to digitize the management of incoming correspondence registers and their scanned documents.

The main purpose is to allow authorized users to:
- Register incoming physical letters into a digital register.
- Store scanned letters and supporting PDF documents.
- Search and filter registered letters.
- View and download archived documents without retrieving physical archives.
- Track user activities and document management history.

This is a standalone application. It is NOT integrated with any existing enterprise application.

The initial application scope is strictly limited to INCOMING MAIL. Do not implement outgoing mail management unless explicitly requested in the future.

The project starts with a clean database. There is no Excel migration or legacy data import requirement.

## 2. CORE DEVELOPMENT PRINCIPLES

Follow these principles throughout development:

1. Build a maintainable, modular, and scalable application.
2. Keep frontend and backend responsibilities clearly separated.
3. Use RESTful API conventions.
4. Apply proper authentication and authorization.
5. Validate all user inputs on both frontend and backend.
6. Never expose internal file storage paths to public users.
7. Store scanned documents outside public web directories.
8. Use database transactions for operations that involve multiple related records.
9. Implement proper error handling and consistent API responses.
10. Avoid unnecessary dependencies and overengineering.
11. Preserve existing project structure unless there is a clear technical reason to change it.
12. Do not introduce breaking changes to existing Docker services or infrastructure.
13. Do not use TypeScript `any` unless there is a compelling reason.
14. Keep code readable, typed, and easy to maintain.

Before implementing a feature:
- Inspect the existing source code.
- Understand the current architecture and conventions.
- Identify reusable components and utilities.
- Explain the intended changes.
- Implement incrementally.
- Test the implementation before moving to the next feature.

Do not assume that a feature already exists. Inspect the repository first.

## 3. SYSTEM ARCHITECTURE

The application uses a containerized architecture.

### Frontend
- Framework: Next.js
- Routing: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Rendering: React Server Components by default; use Client Components only when interactivity requires them.
- API communication: Next.js rewrites to the backend.

### Backend
- Runtime: Node.js
- Framework: Fastify
- Language: TypeScript / JavaScript according to the existing backend implementation.
- Architecture: Modular REST API.
- Responsibilities:
  - Authentication and authorization.
  - Business logic.
  - Database operations.
  - Document upload and retrieval.
  - Validation.
  - Audit logging.

### Database
- DBMS: MariaDB 11.4
- Database name: `arsip_surat`
- Database user: configured through environment variables.
- Use relational database design with appropriate foreign keys, indexes, constraints, and transactions.

### Document Storage
- Store PDF documents on the server filesystem.
- Storage directory inside backend container:
  `/app/storage/documents`
- Host directory:
  `./storage/documents`
- This directory is mounted as a Docker volume/bind mount.
- Files must not be exposed through Next.js static assets or public directories.
- Document access must be authorized through backend endpoints.

### Infrastructure
- Deployment: Docker Compose.
- Server: Ubuntu Server 24.
- External access: Cloudflare Tunnel.
- Domain: `arsipku.hivan.my.id`.
- Existing external Docker network: `proxy`.
- Existing Cloudflare Tunnel container: `cloudflared`.

## 4. DOCKER NETWORK ARCHITECTURE

Existing services:

- `arsip-frontend`
- `arsip-backend`
- `arsip-db`

Docker networks:

### proxy
- External network.
- Shared with the existing Cloudflare Tunnel.
- Frontend is connected to this network.
- Backend and database must NOT be connected to this network.

### arsip-app
- Internal application communication network.
- Frontend and backend are connected here.

### arsip-internal
- Internal database network.
- Backend and MariaDB are connected here.
- Database is isolated from public-facing networks.

Expected communication:

Browser
  |
  v
Cloudflare Tunnel
  |
  v
Next.js Frontend
  |
  v
Fastify Backend
  |
  v
MariaDB

The frontend must communicate with the backend using Docker service DNS:
`http://backend:4000`

The backend connects to MariaDB using:
`mariadb:3306`

IMPORTANT:
- Never recreate or delete the existing external `proxy` network.
- Never interfere with unrelated containers such as Nextcloud, Immich, Samba, or other personal services.
- Do not publish database or backend ports to the host unless explicitly required.
- Preserve the existing Cloudflare Tunnel configuration and other ingress routes.

## 5. FRONTEND CONFIGURATION

The frontend project is located in:

`frontend/`

It uses Next.js App Router.

The existing `next.config.ts` contains:
- `output: "standalone"`
- `cacheComponents: true`
- `partialPrefetching: true`
- Turbopack CSS configuration.
- API rewrites.

The API rewrite pattern should preserve the public API prefix:

`/api/:path*` -> `${BACKEND_URL}/api/:path*`

The health-check endpoint has a special rewrite:

`/api/health` -> `${BACKEND_URL}/health`

The production backend URL is configured during the frontend Docker build:

`BACKEND_URL=http://backend:4000`

Do not replace this with localhost in production.

Public API requests should use relative URLs:

`/api/...`

This ensures that requests go through the same domain and Next.js rewrite layer.

### Frontend design direction

Create a professional, modern, clean, and practical administrative dashboard.

The design should emphasize:
- Readability.
- Efficient data entry.
- Fast searching.
- Clear document status.
- Simple navigation.
- Responsive layout for desktop, tablet, and mobile.

Suggested visual direction:
- Neutral background.
- White or lightly tinted content surfaces.
- Consistent spacing.
- Clear typography.
- Restrained accent colors.
- Subtle borders and shadows.
- Accessible contrast.

Avoid:
- Excessive gradients.
- Unnecessary animations.
- Overly decorative dashboards.
- Excessive card nesting.
- Unnecessary UI complexity.

### Suggested frontend modules

1. Authentication
   - Login.
   - Logout.
   - Session handling.

2. Dashboard
   - Total registered incoming letters.
   - Monthly incoming letter statistics.
   - Recent registered letters.
   - Recent activities.

3. Incoming Mail Register
   - List.
   - Create.
   - Edit.
   - Detail.
   - Search.
   - Filtering.
   - Pagination.

4. Document Management
   - Upload PDF.
   - Document preview.
   - Download.
   - Document metadata.

5. User Management
   - User list.
   - Create user.
   - Edit user.
   - Activate/deactivate user.
   - Role management.

6. Activity Log
   - User activity history.
   - Filter by user, action, and date.

7. Settings
   - Application settings.
   - Register numbering configuration, if needed.

The exact routes and component structure should be decided after inspecting the existing frontend.

## 6. BACKEND ARCHITECTURE

The backend project is located in:

`backend/`

Use a modular structure based on business domains.

Suggested modules:

- auth
- users
- mail-registers
- mail-files
- dashboard
- activity-logs
- settings

Each module should separate responsibilities where appropriate:

- Routes / Controllers
- Services
- Repositories / Database queries
- Schemas / Validation
- Types

Avoid unnecessary abstraction for simple operations.

### API conventions

Base public API prefix:

`/api`

Health check:

`GET /health`

Suggested API endpoints:

#### Authentication
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

#### Dashboard
- GET `/api/dashboard/summary`
- GET `/api/dashboard/recent-mails`
- GET `/api/dashboard/activity`

#### Incoming Mail
- GET `/api/mail-registers`
- GET `/api/mail-registers/:id`
- POST `/api/mail-registers`
- PUT `/api/mail-registers/:id`
- DELETE `/api/mail-registers/:id`

#### Documents
- POST `/api/mail-registers/:id/files`
- GET `/api/mail-files/:id`
- GET `/api/mail-files/:id/download`
- DELETE `/api/mail-files/:id`

#### Users
- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/users`
- PUT `/api/users/:id`
- PATCH `/api/users/:id/status`

#### Activity Logs
- GET `/api/activity-logs`

These endpoints are the proposed API contract, not an instruction to implement all endpoints immediately.

Inspect the existing backend before adding or changing routes.

### API response format

Use a consistent response structure.

Successful response:

{
  "success": true,
  "message": "Request successful",
  "data": {}
}

Error response:

{
  "success": false,
  "message": "An error occurred",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}

Use appropriate HTTP status codes:
- 200: Successful request.
- 201: Resource created.
- 204: Successful request without response body.
- 400: Invalid request.
- 401: Unauthenticated.
- 403: Unauthorized.
- 404: Resource not found.
- 409: Conflict.
- 422: Validation error, if adopted consistently.
- 500: Internal server error.

Never expose stack traces, SQL details, passwords, tokens, or internal filesystem paths in production responses.

## 7. DATABASE DESIGN

Use MariaDB 11.4.

The initial database design should include the following tables.

### users

Purpose: Store application users.

Suggested columns:
- id
- name
- username (unique)
- password_hash
- role
- is_active
- last_login_at
- created_at
- updated_at

Roles:
- admin
- operator
- viewer

Role definitions:

Admin:
- Full application access.
- Manage users.
- Manage incoming mail.
- Manage documents.
- View activity logs.
- Manage application settings.

Operator:
- Create incoming mail records.
- Edit records according to business permissions.
- Upload and manage associated documents.
- Search and view registered mail.

Viewer:
- Search and view incoming mail.
- View authorized documents.
- Cannot create, modify, or delete records.

Enforce authorization in the backend, not only in frontend navigation.

### mail_registers

Purpose: Store incoming mail register records.

Suggested columns:
- id
- agenda_number
- mail_number
- mail_date
- received_date
- sender
- subject
- classification_code
- mail_type
- recipient
- unit_name
- description
- created_by
- created_at
- updated_at
- deleted_at (optional, for soft deletion)

Suggested mail_type values:
- biasa
- penting
- segera
- rahasia

Requirements:
- `agenda_number` must be unique.
- Support searching by agenda number.
- Support searching by mail number.
- Support filtering by sender.
- Support filtering by subject.
- Support filtering by date range.
- Support filtering by mail type.
- Support filtering by classification code.

Do not use MAX(agenda_number) + 1 for numbering.

Use a concurrency-safe numbering mechanism, such as a dedicated sequence table and database transaction with row locking.

Suggested agenda number format:

`001/REG-SM/2026`

The numbering mechanism should support annual sequences.

The exact numbering format should be configurable or easy to change.

### mail_files

Purpose: Store metadata for uploaded documents.

Suggested columns:
- id
- mail_register_id
- original_name
- stored_name
- file_path
- mime_type
- file_size
- uploaded_by
- uploaded_at

Requirements:
- One mail register may have multiple files.
- Store original filename for display.
- Generate a unique random stored filename.
- Never trust the original filename as a storage path.
- Validate file extension and actual MIME/content.
- Restrict uploads to PDF initially.
- Set a reasonable configurable file-size limit.
- Prevent path traversal.
- Only authenticated and authorized users may preview or download documents.

### activity_logs

Purpose: Record important application activities.

Suggested columns:
- id
- user_id
- action
- entity_type
- entity_id
- description
- created_at

Record activities such as:
- Login.
- Logout.
- Create mail register.
- Update mail register.
- Delete or archive mail register.
- Upload document.
- Delete document.
- Download or preview document, if required by the audit policy.
- User management actions.

Activity logs should not be freely editable by normal users.

### Database design principles

- Use appropriate indexes.
- Add foreign keys.
- Use consistent naming conventions.
- Use transactions for multi-table operations.
- Define deletion behavior carefully.
- Preserve historical archival data.
- Avoid cascading deletion of important archival records.
- Use UTC or a consistent timezone strategy for timestamps, with Indonesian local time handling at the presentation layer.

Before implementing migrations, inspect the current database and existing migration tooling.

Do not assume the tables have already been created.

## 8. DOCUMENT UPLOAD AND STORAGE

Document storage is a critical part of this application.

The purpose is to replace the need to retrieve physical incoming mail archives for routine reference.

Requirements:

1. Allow PDF uploads for each incoming mail record.
2. Support multiple PDF files per record.
3. Store files outside public directories.
4. Generate unique stored filenames.
5. Keep original filenames in the database.
6. Validate file type, size, and content.
7. Ensure file ownership and access permissions are appropriate.
8. Stream files through authenticated backend endpoints.
9. Support inline PDF preview.
10. Support forced download.
11. Prevent unauthorized direct access.
12. Prevent path traversal and filename manipulation.
13. Handle failed uploads safely.
14. Avoid orphaned files and database records.
15. Log relevant document activities.

Suggested storage structure:

storage/
  documents/
    2026/
      01/
      02/
      03/

The actual directory organization may be adjusted based on implementation requirements.

Do not store PDF binary data in MariaDB unless there is a compelling technical reason.

When deleting or replacing documents, consider archival retention requirements before permanently removing physical files.

## 9. AUTHENTICATION AND SECURITY

Implement secure authentication.

Requirements:
- Hash passwords using Argon2id or bcrypt with appropriate settings.
- Never store plaintext passwords.
- Validate credentials on the backend.
- Enforce role-based access control.
- Protect private API endpoints.
- Implement session expiration.
- Protect against brute-force login attempts through rate limiting.
- Validate and sanitize user inputs.
- Use parameterized SQL queries.
- Protect against SQL injection.
- Protect against XSS.
- Protect against CSRF if using cookie-based authentication.
- Set secure cookie attributes in production.
- Never expose secrets through frontend environment variables.
- Do not commit `.env` files.
- Provide a safe initial admin creation process.
- Avoid public registration unless explicitly requested.

If choosing between JWT and cookie-based sessions, evaluate the existing architecture and select a secure, maintainable approach. Explain the decision before implementation.

## 10. SEARCH AND PAGINATION

The application will be used to retrieve archival records efficiently.

Search should support:
- Agenda number.
- Incoming mail number.
- Sender.
- Subject.
- Classification code.
- Recipient.
- Unit name.

Filters:
- Mail date range.
- Received date range.
- Mail type.
- Sender.
- Unit.
- Classification code.

Requirements:
- Server-side filtering.
- Server-side pagination.
- Stable sorting.
- Proper database indexes.
- Debounced frontend search.
- Clear empty states.
- Loading and error states.

Do not load all archival records into the browser at once.

## 11. DASHBOARD

The dashboard should provide useful operational information.

Suggested metrics:
- Total registered incoming letters.
- Incoming letters this month.
- Incoming letters this year.
- Total stored PDF documents.
- Recent registered incoming mail.
- Recent user activities.

Avoid unnecessary metrics that do not support actual archive management.

Statistics must be calculated from the backend/database.

## 12. DEPLOYMENT AND ENVIRONMENT VARIABLES

The application is deployed using Docker Compose.

Keep configuration environment-based.

Examples:

DB_HOST=mariadb
DB_PORT=3306
DB_NAME=arsip_surat
DB_USER=...
DB_PASSWORD=...
DB_ROOT_PASSWORD=...

BACKEND_URL=http://backend:4000

Other secrets and configuration values should be defined only when needed.

Rules:
- Do not hardcode credentials.
- Do not commit secrets.
- Keep `.env.example` updated.
- Do not unnecessarily expose internal service ports.
- Preserve the current volume names and networks.
- Ensure persistent database and document storage.
- Test production builds before deployment.
- Provide database and document backup procedures.

The production frontend must communicate with the backend through the configured rewrite mechanism.

The public domain must not directly expose MariaDB or the Fastify container.

## 13. DEVELOPMENT WORKFLOW

Work incrementally.

Recommended implementation phases:

### Phase 1 — Project inspection
- Inspect repository structure.
- Inspect frontend package dependencies.
- Inspect backend package dependencies.
- Inspect Docker Compose.
- Inspect environment configuration.
- Inspect database connection setup.
- Identify existing implementation and gaps.

Deliver a short architecture assessment before making major changes.

### Phase 2 — Database foundation
- Define database schema.
- Implement migration strategy.
- Create users table.
- Create mail register table.
- Create document metadata table.
- Create activity log table.
- Add required indexes and constraints.
- Verify database connectivity.

### Phase 3 — Authentication
- Implement login.
- Implement logout.
- Implement current-user endpoint.
- Implement password hashing.
- Implement session handling.
- Implement role-based access control.
- Create initial admin securely.

### Phase 4 — Incoming mail register
- Implement list and pagination.
- Implement search and filtering.
- Implement create.
- Implement detail.
- Implement update.
- Implement controlled deletion.
- Implement concurrency-safe agenda numbering.

### Phase 5 — Document management
- Implement PDF upload.
- Implement PDF validation.
- Implement private storage.
- Implement preview.
- Implement download.
- Implement access control.
- Implement activity logging.

### Phase 6 — Dashboard
- Implement dashboard statistics.
- Implement recent incoming mail.
- Implement recent activity.

### Phase 7 — User management and audit
- Implement user management.
- Implement role management.
- Implement activity log interface.

### Phase 8 — Testing and hardening
- Test authentication.
- Test authorization.
- Test validation.
- Test file upload and retrieval.
- Test concurrent agenda numbering.
- Test search and pagination.
- Test production build.
- Test deployment through Cloudflare Tunnel.
- Review security and backup procedures.

Do not implement all phases in one large change.

Complete and verify one phase before moving to the next.

## 14. TESTING REQUIREMENTS

Write tests for important business logic.

Prioritize:
- Authentication and authorization.
- Agenda numbering.
- Incoming mail creation and update.
- Duplicate agenda number prevention.
- PDF upload validation.
- Unauthorized document access.
- Search and filtering.
- Pagination.
- Database transaction behavior.

Test both successful and failed scenarios.

Do not claim that a feature works without testing it.

## 15. AGENT BEHAVIOR AND RESPONSE EXPECTATIONS

Act as a senior full-stack engineer responsible for maintaining this project.

When working on this repository:

1. Inspect existing code before proposing changes.
2. Do not unnecessarily rewrite existing files.
3. Preserve existing working functionality.
4. Explain the purpose of significant changes.
5. Identify files that will be created or modified.
6. Keep changes focused on the current task.
7. Use clear and descriptive naming.
8. Use strict TypeScript types where applicable.
9. Handle errors explicitly.
10. Follow security best practices.
11. Provide commands for migrations, builds, and tests.
12. Report test results honestly.
13. Identify any manual actions required from the developer.
14. Never modify server infrastructure without explicit instruction.
15. Never delete Docker volumes, databases, networks, or uploaded documents without explicit confirmation.

If requirements are ambiguous:
- Ask a focused clarification question.
- Do not invent business rules.
- Do not implement assumptions that could cause archival data loss.

When asked to implement a feature:
- First explain the proposed approach briefly.
- Then inspect the relevant source code.
- Implement the smallest complete change.
- Run relevant tests or checks.
- Summarize changed files and verification results.

## 16. CURRENT PROJECT STATUS

Infrastructure and initial application deployment have already been completed.

Confirmed environment:
- Ubuntu Server 24.
- Docker Engine 29.6.2.
- Docker Compose 5.3.1.
- Next.js frontend container: `arsip-frontend`.
- Fastify backend container: `arsip-backend`.
- MariaDB container: `arsip-db`.
- Database: `arsip_surat`.
- Domain: `arsipku.hivan.my.id`.
- Cloudflare Tunnel is operational.
- Frontend is accessible through the public domain.
- Backend health endpoint is accessible through the frontend rewrite:
  `GET /api/health` -> backend `GET /health`.
- Frontend and backend Docker network communication has been verified.
- Backend and MariaDB network isolation has been verified.
- Persistent database volume exists.
- Document storage bind mount exists.

IMPORTANT:
Infrastructure is working, but do not assume that all application features, database tables, migrations, authentication, or business APIs have already been implemented.

Inspect the actual repository and current database before continuing.

## 17. FIRST TASK FOR THE AGENT

Start by performing a READ-ONLY inspection of the current repository.

Do not modify any files yet.

Inspect:
1. Root directory structure.
2. Frontend directory structure.
3. Backend directory structure.
4. Frontend dependencies and scripts.
5. Backend dependencies and scripts.
6. Next.js configuration.
7. Backend entry point and route registration.
8. Database connection implementation.
9. Docker Compose configuration.
10. Environment variable usage.
11. Existing database tables and migration tooling, if available.

Then provide:

A. Current architecture overview.

B. Existing implementation inventory.

C. Missing components compared with this project specification.

D. Potential architectural or security issues.

E. Recommended implementation order.

F. Files likely to be created or modified for Phase 1 and Phase 2.

Do not start implementing Phase 2 until the inspection report is presented and reviewed.

The goal is to build a reliable, secure, maintainable incoming-mail archive management application without disrupting the existing working deployment.
