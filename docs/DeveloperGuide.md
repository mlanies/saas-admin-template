# Developer Guide - User Groups System

## Overview

This guide provides technical details for developers working with the User Groups System. It covers the architecture, database schema, API design, and implementation details.

## Architecture

### System Components

1. **Database Layer** - D1 database with three main tables
2. **Service Layer** - Business logic services
3. **API Layer** - RESTful endpoints
4. **Frontend Layer** - React components and Astro pages
5. **Auth Layer** - Permission checking and user authentication

### Technology Stack

- **Backend**: Cloudflare Workers + D1 Database
- **Frontend**: Astro + React + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Authentication**: API token-based authentication

## Database Schema

### Tables

#### groups
```sql
CREATE TABLE groups (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### user_groups
```sql
CREATE TABLE user_groups (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);
```

#### group_permissions
```sql
CREATE TABLE group_permissions (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    group_id TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE(group_id, resource, action)
);
```

### Relationships

- **groups** ↔ **user_groups** (1:N)
- **groups** ↔ **group_permissions** (1:N)
- **user** ↔ **user_groups** (1:N)

## Authentication Architecture

### API Token Authentication

The system uses API token-based authentication for all group management operations. This aligns with the existing project architecture.

#### Environment Variables
- `API_TOKEN`: Development API token (set in `.dev.vars`)
- `DB`: D1 database for main application data
- `AUTH_DB`: D1 database for authentication and user data

#### Database Separation
- **Main Data**: Stored in `DB` (customers, subscriptions, etc.)
- **User & Group Data**: Stored in `AUTH_DB` (users, groups, user_groups, group_permissions)

#### API Endpoint Authentication
All group management API endpoints use `validateApiTokenResponse()` for authentication:

```typescript
import { validateApiTokenResponse } from '@/lib/api';

export const GET: APIRoute = async ({ request, locals }) => {
  const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { 
    API_TOKEN: string; 
    AUTH_DB: D1Database 
  };

  const invalidTokenResponse = await validateApiTokenResponse(request, API_TOKEN);
  if (invalidTokenResponse) return invalidTokenResponse;
  
  // ... rest of the endpoint logic
};
```

#### Frontend Authentication
React components use API tokens for authentication:

```typescript
const response = await fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`,
  },
  body: JSON.stringify(data),
});
```

## Service Layer

### GroupService

Handles CRUD operations for groups.

```typescript
class GroupService {
  async getAll(): Promise<Group[]>
  async getById(id: string): Promise<Group | null>
  async create(data: CreateGroupData): Promise<Group>
  async update(id: string, data: UpdateGroupData): Promise<Group | null>
  async delete(id: string): Promise<boolean>
  async getUsersCount(groupId: string): Promise<number>
}
```

### UserGroupService

Manages user-group relationships.

```typescript
class UserGroupService {
  async getUsersInGroup(groupId: string): Promise<UserInGroup[]>
  async addUserToGroup(groupId: string, data: AddUserToGroupData): Promise<UserGroup>
  async removeUserFromGroup(groupId: string, userId: string): Promise<boolean>
  async updateUserRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<UserGroup | null>
  async getUserGroups(userId: string): Promise<{ group_id: string; role: string }[]>
  async isUserInGroup(userId: string, groupId: string): Promise<boolean>
  async getUserRoleInGroup(userId: string, groupId: string): Promise<'admin' | 'member' | null>
}
```

### GroupPermissionService

Handles group permissions.

```typescript
class GroupPermissionService {
  async getGroupPermissions(groupId: string): Promise<GroupPermission[]>
  async addPermission(groupId: string, data: CreatePermissionData): Promise<GroupPermission>
  async removePermission(groupId: string, permissionId: string): Promise<boolean>
  async hasPermission(groupId: string, resource: string, action: string): Promise<boolean>
  async getUserPermissions(userId: string): Promise<{ resource: string; action: string }[]>
  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean>
  async setGroupPermissions(groupId: string, permissions: CreatePermissionData[]): Promise<void>
}
```

## API Design

### RESTful Endpoints

All endpoints follow REST conventions:

- `GET /api/groups` - List resources
- `POST /api/groups` - Create resource
- `GET /api/groups/:id` - Get specific resource
- `PUT /api/groups/:id` - Update resource
- `DELETE /api/groups/:id` - Delete resource

### Error Handling

Standardized error responses:

```typescript
interface ApiError {
  error: string;
  details?: any;
}
```

### Authentication & Authorization

All endpoints require:
1. Valid session cookie
2. Appropriate permissions for the requested action

```typescript
// Check authentication
const auth = checkAuth(request);
if (!auth.isAuthenticated) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// Check permissions
await requirePermission(DB, userId, 'groups', 'read');
```

## Frontend Components

### React Components

#### GroupList
- Displays all groups in a table
- Supports search and filtering
- Handles group deletion

#### GroupForm
- Form for creating/editing groups
- Client-side validation
- Error handling

#### GroupUsers
- Manages users within a group
- Add/remove users
- Change user roles

#### GroupPermissions
- Permission matrix interface
- Visual permission management
- Bulk permission updates

### Astro Pages

- `/admin/groups` - Groups list
- `/admin/groups/create` - Create group
- `/admin/groups/[id]` - Group details
- `/admin/groups/[id]/users` - Manage users
- `/admin/groups/[id]/permissions` - Manage permissions

## Permission System

### Permission Model

```typescript
type Resource = 'customers' | 'subscriptions' | 'admin' | 'groups';
type Action = 'read' | 'write' | 'delete' | 'admin';
```

### Permission Checking

```typescript
// Check if user has permission
const hasAccess = await hasPermission(DB, userId, 'customers', 'read');

// Require permission (throws error if not granted)
await requirePermission(DB, userId, 'groups', 'write');
```

### Permission Inheritance

Users inherit permissions from all groups they belong to. The system checks:
1. User's direct group memberships
2. Group permissions for each membership
3. Combines all permissions (union)

## Security Considerations

### Input Validation

- Server-side validation for all inputs
- SQL injection prevention via parameterized queries
- XSS prevention through proper escaping

### Access Control

- Authentication required for all endpoints
- Permission-based authorization
- Role-based access within groups

### Data Protection

- Sensitive data not logged
- Secure session management
- HTTPS enforcement

## Testing

### Unit Tests

```typescript
describe('GroupService', () => {
  it('should create a group', async () => {
    const service = new GroupService(mockDB);
    const group = await service.create({ name: 'Test Group' });
    expect(group.name).toBe('Test Group');
  });
});
```

### Integration Tests

```typescript
describe('Groups API', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const response = await fetch('/api/groups');
    expect(response.status).toBe(401);
  });
});
```

### E2E Tests

```typescript
describe('Group Management', () => {
  it('should create and manage groups', async () => {
    await page.goto('/admin/groups');
    await page.click('[data-testid="create-group"]');
    // ... test flow
  });
});
```

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns
- Efficient JOIN queries
- Pagination for large datasets

### Caching Strategy

- Cache user permissions
- Cache group memberships
- Invalidate cache on changes

### API Optimization

- Minimal data transfer
- Efficient serialization
- Proper HTTP status codes

## Deployment

### Environment Setup

1. **Database Migration**
   ```bash
   npm run db:migrate:remote
   ```

2. **Build Process**
   ```bash
   npm run build
   ```

3. **Deployment**
   ```bash
   npm run deploy
   ```

### Environment Variables

```env
# Required
DB_NAME=your-database-name

# Optional
NODE_ENV=production
LOG_LEVEL=info
```

## Monitoring & Logging

### Logging

- Request/response logging
- Error tracking
- Performance metrics

### Monitoring

- API response times
- Database query performance
- Error rates

### Alerts

- High error rates
- Performance degradation
- Security incidents

## Future Enhancements

### Planned Features

1. **Bulk Operations**
   - Bulk user addition
   - Bulk permission updates
   - Group templates

2. **Advanced Permissions**
   - Time-based permissions
   - Conditional permissions
   - Permission inheritance rules

3. **Integration**
   - Webhook notifications
   - Audit logging
   - SSO integration

### API Versioning

- Version prefix in URLs
- Backward compatibility
- Deprecation notices

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up local database: `npm run db:migrate`
4. Start development server: `npm run dev`

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Testing Requirements

- Unit tests for services
- Integration tests for APIs
- E2E tests for critical flows

## Support

### Documentation

- API documentation
- User guide
- Code comments

### Community

- GitHub issues
- Discussion forums
- Code reviews

### Professional Support

- Enterprise support plans
- Custom development
- Training and consulting 