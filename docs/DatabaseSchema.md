# Database Schema - User Groups System

## Overview

This document describes the database schema for the User Groups System. The system uses Cloudflare D1 database with SQLite syntax.

## Tables

### 1. groups

Stores basic information about user groups.

```sql
CREATE TABLE groups (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique identifier for the group (UUID)
- `name` - Group name (required)
- `description` - Optional group description
- `created_at` - Timestamp when the group was created
- `updated_at` - Timestamp when the group was last updated

**Constraints:**
- Primary key on `id`
- `name` is required (NOT NULL)

**Indexes:**
- Primary key index on `id`
- Consider adding index on `name` for search functionality

### 2. user_groups

Manages the many-to-many relationship between users and groups.

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

**Columns:**
- `id` - Unique identifier for the user-group relationship
- `user_id` - Reference to the user table
- `group_id` - Reference to the groups table
- `role` - User's role in the group ('admin' or 'member')
- `joined_at` - Timestamp when the user joined the group

**Constraints:**
- Primary key on `id`
- Foreign key to `user(id)` with CASCADE delete
- Foreign key to `groups(id)` with CASCADE delete
- Unique constraint on `(user_id, group_id)` to prevent duplicate memberships

**Indexes:**
- Primary key index on `id`
- Foreign key indexes on `user_id` and `group_id`
- Unique index on `(user_id, group_id)`

### 3. group_permissions

Stores permissions for each group.

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

**Columns:**
- `id` - Unique identifier for the permission
- `group_id` - Reference to the groups table
- `resource` - The resource being protected (e.g., 'customers', 'subscriptions')
- `action` - The action allowed (e.g., 'read', 'write', 'delete')
- `created_at` - Timestamp when the permission was created

**Constraints:**
- Primary key on `id`
- Foreign key to `groups(id)` with CASCADE delete
- Unique constraint on `(group_id, resource, action)` to prevent duplicate permissions

**Indexes:**
- Primary key index on `id`
- Foreign key index on `group_id`
- Unique index on `(group_id, resource, action)`

## Relationships

### Entity Relationship Diagram

```
user (existing table)
├── id (PK)
├── email
└── created_at

groups
├── id (PK)
├── name
├── description
├── created_at
└── updated_at

user_groups
├── id (PK)
├── user_id (FK -> user.id)
├── group_id (FK -> groups.id)
├── role
└── joined_at

group_permissions
├── id (PK)
├── group_id (FK -> groups.id)
├── resource
├── action
└── created_at
```

### Relationship Types

1. **user ↔ user_groups** (1:N)
   - One user can belong to multiple groups
   - Each user-group relationship is unique

2. **groups ↔ user_groups** (1:N)
   - One group can have multiple users
   - Each user-group relationship is unique

3. **groups ↔ group_permissions** (1:N)
   - One group can have multiple permissions
   - Each permission is unique per group-resource-action combination

## Data Types

### Text Fields
- `id` - UUID strings (32 characters)
- `name` - Group names (max 255 characters recommended)
- `description` - Group descriptions (max 500 characters recommended)
- `resource` - Resource identifiers (e.g., 'customers', 'subscriptions')
- `action` - Action identifiers (e.g., 'read', 'write', 'delete')
- `role` - Role identifiers ('admin', 'member')

### Timestamp Fields
- `created_at` - ISO 8601 timestamp
- `updated_at` - ISO 8601 timestamp
- `joined_at` - ISO 8601 timestamp

## Constraints and Validation

### Business Rules

1. **Group Names**
   - Must be unique within the system
   - Cannot be empty
   - Maximum length: 255 characters

2. **User-Group Relationships**
   - A user cannot be in the same group twice
   - When a user is deleted, all group memberships are removed
   - When a group is deleted, all memberships and permissions are removed

3. **Permissions**
   - Each group can have only one permission per resource-action combination
   - Valid resources: 'customers', 'subscriptions', 'admin', 'groups'
   - Valid actions: 'read', 'write', 'delete', 'admin'

4. **Roles**
   - Valid roles: 'admin', 'member'
   - Default role: 'member'

## Indexes

### Recommended Indexes

```sql
-- For efficient group searches
CREATE INDEX idx_groups_name ON groups(name);

-- For efficient user membership queries
CREATE INDEX idx_user_groups_user_id ON user_groups(user_id);
CREATE INDEX idx_user_groups_group_id ON user_groups(group_id);

-- For efficient permission queries
CREATE INDEX idx_group_permissions_group_id ON group_permissions(group_id);
CREATE INDEX idx_group_permissions_resource ON group_permissions(resource);
CREATE INDEX idx_group_permissions_action ON group_permissions(action);

-- Composite indexes for common queries
CREATE INDEX idx_user_groups_user_role ON user_groups(user_id, role);
CREATE INDEX idx_group_permissions_group_resource ON group_permissions(group_id, resource);
```

## Sample Data

### Groups
```sql
INSERT INTO groups (id, name, description) VALUES
('g1', 'Administrators', 'System administrators with full access'),
('g2', 'Customer Support', 'Customer support team'),
('g3', 'Sales Team', 'Sales and marketing team');
```

### User Groups
```sql
INSERT INTO user_groups (user_id, group_id, role) VALUES
('u1', 'g1', 'admin'),
('u2', 'g1', 'member'),
('u3', 'g2', 'admin'),
('u4', 'g2', 'member'),
('u5', 'g3', 'member');
```

### Group Permissions
```sql
INSERT INTO group_permissions (group_id, resource, action) VALUES
-- Administrators have full access
('g1', 'customers', 'admin'),
('g1', 'subscriptions', 'admin'),
('g1', 'admin', 'admin'),
('g1', 'groups', 'admin'),

-- Customer Support can read/write customers, read subscriptions
('g2', 'customers', 'read'),
('g2', 'customers', 'write'),
('g2', 'subscriptions', 'read'),

-- Sales Team can read customers and subscriptions
('g3', 'customers', 'read'),
('g3', 'subscriptions', 'read');
```

## Common Queries

### Get All Groups with User Count
```sql
SELECT 
    g.*,
    COUNT(ug.user_id) as users_count
FROM groups g
LEFT JOIN user_groups ug ON g.id = ug.group_id
GROUP BY g.id
ORDER BY g.created_at DESC;
```

### Get User's Groups and Roles
```sql
SELECT 
    g.name as group_name,
    g.description,
    ug.role,
    ug.joined_at
FROM user_groups ug
JOIN groups g ON ug.group_id = g.id
WHERE ug.user_id = ?
ORDER BY ug.joined_at DESC;
```

### Get User's Permissions
```sql
SELECT DISTINCT
    gp.resource,
    gp.action
FROM group_permissions gp
JOIN user_groups ug ON gp.group_id = ug.group_id
WHERE ug.user_id = ?
ORDER BY gp.resource, gp.action;
```

### Get Group Members
```sql
SELECT 
    u.email,
    ug.role,
    ug.joined_at
FROM user_groups ug
JOIN user u ON ug.user_id = u.id
WHERE ug.group_id = ?
ORDER BY ug.joined_at DESC;
```

## Migration Strategy

### Version 1.0
- Initial schema creation
- Basic group management
- User-group relationships
- Permission system

### Future Versions
- Add audit logging table
- Add group templates
- Add time-based permissions
- Add permission inheritance rules

## Performance Considerations

### Query Optimization
- Use indexes for frequently queried columns
- Limit result sets with pagination
- Use efficient JOIN strategies

### Data Volume
- Monitor table sizes
- Consider archiving old data
- Implement cleanup procedures

### Backup Strategy
- Regular database backups
- Test restore procedures
- Document recovery processes

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use parameterized queries
- Implement proper access controls

### Audit Trail
- Log all permission changes
- Track group membership changes
- Monitor access patterns

### Compliance
- GDPR considerations for user data
- Data retention policies
- Privacy impact assessments 