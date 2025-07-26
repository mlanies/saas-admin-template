# API Documentation - User Groups System

## Authentication

All API endpoints require authentication via API tokens. The system uses token-based authentication for all group management operations.

### Environment Variables
- `API_TOKEN`: Your development API token (set in `.dev.vars`)
- `DB`: D1 database instance for main data
- `AUTH_DB`: D1 database instance for authentication and user data

**Note**: Group management tables (`groups`, `user_groups`, `group_permissions`) are stored in `AUTH_DB` to maintain consistency with user data.

## Base URL

```
https://your-domain.com/api
```

## Common Headers

```
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN
```

## Response Codes

- `200` - Successful request
- `201` - Resource created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Access denied
- `404` - Resource not found
- `500` - Internal server error

## Groups

### Get All Groups

```http
GET /api/groups
```

**Response:**
```json
[
  {
    "id": "group-id",
    "name": "Administrators",
    "description": "System administrators",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "users_count": 5
  }
]
```

### Create Group

```http
POST /api/groups
Content-Type: application/json

{
  "name": "New Group",
  "description": "Group description"
}
```

**Ответ:**
```json
{
  "id": "new-group-id",
  "name": "New Group",
  "description": "Group description",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Group by ID

```http
GET /api/groups/{id}
```

**Ответ:**
```json
{
  "id": "group-id",
  "name": "Administrators",
  "description": "System administrators",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update Group

```http
PUT /api/groups/{id}
Content-Type: application/json

{
  "name": "Updated Group Name",
  "description": "Updated description"
}
```

**Ответ:**
```json
{
  "id": "group-id",
  "name": "Updated Group Name",
  "description": "Updated description",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Delete Group

```http
DELETE /api/groups/{id}
```

**Ответ:**
```json
{
  "message": "Group deleted successfully"
}
```

## Users in Groups

### Get Group Users

```http
GET /api/groups/{id}/users
```

**Ответ:**
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "role": "admin",
    "joined_at": "2024-01-01T00:00:00Z"
  }
]
```

### Add User to Group

```http
POST /api/groups/{id}/users
Content-Type: application/json

{
  "user_id": "user-id",
  "role": "member"
}
```

**Ответ:**
```json
{
  "id": "user-group-id",
  "user_id": "user-id",
  "group_id": "group-id",
  "role": "member",
  "joined_at": "2024-01-01T00:00:00Z"
}
```

### Remove User from Group

```http
DELETE /api/groups/{id}/users/{userId}
```

**Ответ:**
```json
{
  "message": "User removed from group successfully"
}
```

### Изменить роль пользователя

```http
PUT /api/groups/{id}/users/{userId}/role
Content-Type: application/json

{
  "role": "admin"
}
```

**Ответ:**
```json
{
  "id": "user-group-id",
  "user_id": "user-id",
  "group_id": "group-id",
  "role": "admin",
  "joined_at": "2024-01-01T00:00:00Z"
}
```

## Group Permissions

### Get Group Permissions

```http
GET /api/groups/{id}/permissions
```

**Ответ:**
```json
[
  {
    "id": "permission-id",
    "group_id": "group-id",
    "resource": "customers",
    "action": "read",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Добавить разрешение

```http
POST /api/groups/{id}/permissions
Content-Type: application/json

{
  "resource": "customers",
  "action": "write"
}
```

**Ответ:**
```json
{
  "id": "permission-id",
  "group_id": "group-id",
  "resource": "customers",
  "action": "write",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Удалить разрешение

```http
DELETE /api/groups/{id}/permissions/{permissionId}
```

**Ответ:**
```json
{
  "message": "Permission removed successfully"
}
```

## Пользователи

### Get All Users

```http
GET /api/users
```

**Ответ:**
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Errors

### Validation Error Example

```json
{
  "error": "Group name is required"
}
```

### Access Error Example

```json
{
  "error": "Access denied"
}
```

### Not Found Error Example

```json
{
  "error": "Group not found"
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get all groups
const response = await fetch('/api/groups', {
  headers: {
    'Cookie': `session=${sessionToken}`
  }
});
const groups = await response.json();

// Create group
const newGroup = await fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `session=${sessionToken}`
  },
  body: JSON.stringify({
    name: 'New Group',
    description: 'Group description'
  })
});

// Add user to group
await fetch(`/api/groups/${groupId}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `session=${sessionToken}`
  },
  body: JSON.stringify({
    user_id: userId,
    role: 'member'
  })
});
```

### cURL

```bash
# Get all groups
curl -H "Cookie: session=<token>" \
     https://your-domain.com/api/groups

# Create group
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Cookie: session=<token>" \
     -d '{"name":"New Group","description":"Description"}' \
     https://your-domain.com/api/groups

# Add user to group
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Cookie: session=<token>" \
     -d '{"user_id":"user-id","role":"member"}' \
     https://your-domain.com/api/groups/group-id/users
```

## Limitations

- Maximum group name length: 255 characters
- Maximum group description length: 500 characters
- A user can only be in one group with the same ID
- Permissions are unique for the combination of group_id + resource + action

## Versioning

Current API version: v1

All API changes will be documented with version information. 