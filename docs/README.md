# User Groups System - Documentation

## Overview

The User Groups System for SaaS Admin Template provides the ability to create groups, manage users within groups, and configure access permissions.

## Architecture

### Database

The system uses three main tables:

1. **groups** - basic group information
2. **user_groups** - user-group relationships (many-to-many)
3. **group_permissions** - group permissions

### API Endpoints

#### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

#### Users in Groups
- `GET /api/groups/:id/users` - Get group users
- `POST /api/groups/:id/users` - Add user to group
- `DELETE /api/groups/:id/users/:userId` - Remove user from group
- `PUT /api/groups/:id/users/:userId/role` - Change user role

#### Group Permissions
- `GET /api/groups/:id/permissions` - Get group permissions
- `POST /api/groups/:id/permissions` - Add permission
- `DELETE /api/groups/:id/permissions/:permissionId` - Remove permission

## User Roles

### In Groups
- **Admin** - can manage the group, add/remove users, change permissions
- **Member** - has access according to group permissions

### Resource Permissions
- **customers** - customer management
- **subscriptions** - subscription management
- **admin** - admin panel access
- **groups** - group management

### Actions
- **read** - view
- **write** - create and edit
- **delete** - delete
- **admin** - full access

## Usage

### Creating a Group
1. Go to the "Groups" section in the admin panel
2. Click "Create Group"
3. Fill in the group name and description
4. Click "Create Group"

### Managing Users
1. Open the group
2. Go to the "Manage Users" section
3. Add users by selecting them from the list
4. Assign roles (Admin or Member)

### Setting Permissions
1. Open the group
2. Go to the "Permissions" section
3. Use the permission matrix to configure access
4. Click "Save Permissions"

## Security

- All API endpoints are protected by authentication checks
- Permission verification for all operations
- Data validation on server and client
- Protection against SQL injection through parameterized queries

## Development

### File Structure
```
src/
├── components/admin/groups/
│   ├── GroupList.tsx
│   ├── GroupForm.tsx
│   ├── GroupUsers.tsx
│   └── GroupPermissions.tsx
├── lib/services/
│   ├── group.ts
│   ├── user-group.ts
│   └── group-permission.ts
├── pages/api/groups/
│   ├── index.ts
│   ├── [id].ts
│   ├── [id]/users.ts
│   ├── [id]/users/[userId].ts
│   ├── [id]/permissions.ts
│   └── [id]/permissions/[permissionId].ts
└── pages/admin/groups/
    ├── index.astro
    ├── create.astro
    ├── [id].astro
    ├── [id]/users.astro
    └── [id]/permissions.astro
```

### Adding New Permissions

1. Update constants in `GroupPermissions.tsx`:
```typescript
const RESOURCES = [
  // ... existing resources
  { id: 'new-resource', label: 'New Resource', description: 'Description' }
];

const ACTIONS = [
  // ... existing actions
  { id: 'new-action', label: 'New Action', description: 'Description' }
];
```

2. Update types in `group-permission.ts`:
```typescript
export type Resource = 'customers' | 'subscriptions' | 'admin' | 'groups' | 'new-resource';
export type Action = 'read' | 'write' | 'delete' | 'admin' | 'new-action';
```

## Testing

### Unit Tests
- Service testing
- Validation testing

### Integration Tests
- API endpoint testing
- Permission verification testing

### E2E Tests
- Main usage scenario testing
- UI component testing

## Migrations

To apply database migrations:

```bash
# Local development
npm run db:migrate

# Production
npm run db:migrate:remote
```

## Deployment

1. Apply database migrations
2. Build the project: `npm run build`
3. Deploy to Cloudflare: `npm run deploy`

## Support

If you encounter issues:
1. Check logs in Cloudflare Dashboard
2. Ensure migrations are applied
3. Check user access rights
4. Refer to API documentation 