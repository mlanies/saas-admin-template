# SaaS Admin Template with Authentication & User Groups

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/saas-admin-template)

![SaaS Admin Template](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/52b88668-0144-489c-dd02-fe620270ba00/public)

<!-- dash-content-start -->

A complete admin dashboard template built with Astro, Shadcn UI, and Cloudflare's developer stack. Features secure user authentication, comprehensive role-based access control, and advanced user group management. Quickly deploy a fully functional admin interface with customer and subscription management capabilities.

## Features

- 🎨 Modern UI built with Astro and Shadcn UI
- 🔐 **Secure API token-based authentication system**
- 👥 **Advanced user groups and role-based access control**
- 🔑 **Comprehensive permission system** with resource-based access control
- 🎯 **Complete group management** - create, edit, delete groups
- 👤 **User management within groups** - add/remove users, assign roles
- 🔒 **Granular permissions** - resource-level access control (customers, subscriptions, admin, groups)
- 💳 Customer management
- 📊 Subscription tracking
- 🚀 Deploy to Cloudflare Workers
- 📦 Powered by Cloudflare D1 database
- 🔑 KV storage for sessions
- ✨ Clean, responsive interface
- 🔍 Data validation with Zod
- 📚 Complete documentation and API reference

## Tech Stack

- Frontend: [Astro](https://astro.build)
- UI Components: [Shadcn UI](https://ui.shadcn.com)
- Database: [Cloudflare D1](https://developers.cloudflare.com/d1)
- Session Storage: [Cloudflare KV](https://developers.cloudflare.com/kv)
- Deployment: [Cloudflare Workers](https://workers.cloudflare.com)
- Validation: [Zod](https://github.com/colinhacks/zod)
- Authentication: API token-based authentication

## User Groups System

The SaaS Admin Template includes a comprehensive user groups and permissions system:

### 🎯 Group Management
- **Create, edit, and delete groups** with intuitive UI
- **User assignment** - add/remove users from groups
- **Role-based access** - assign admin or member roles within groups
- **Group permissions** - configure resource-level access control

### 🔒 Permission System
- **Resources**: customers, subscriptions, admin, groups
- **Actions**: read, write, delete, admin
- **Granular control** - fine-tuned access permissions
- **Hierarchical roles** - admin and member roles within groups

### 🛠️ API Endpoints
- Complete CRUD operations for groups
- User management within groups
- Permission management
- All endpoints use secure API token authentication

### 📱 User Interface
- Modern, responsive design with Shadcn UI
- Intuitive group management interface
- Real-time permission updates
- Seamless integration with existing admin features

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/d1-template#setup-steps) before deploying.

<!-- dash-content-end -->

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
# Create a .dev.vars file for local development
cp .dev.vars.example .dev.vars
```

Add your API token and authentication settings:

```
API_TOKEN=your_token_here
```

_An API token is required to authenticate requests to the API. You should generate this before trying to run the project locally or deploying it._

3. Create D1 databases for the application:

```bash
# Main database for customers and subscriptions
npx wrangler d1 create admin-db

# Authentication database for users
npx wrangler d1 create openauth-template-auth-db
```

...and update the `database_id` fields in `wrangler.jsonc` with the new database IDs.

4. Create KV namespace for session storage:

```bash
npx wrangler kv namespace create AUTH_STORAGE
```

...and update the `id` field in `wrangler.jsonc` with the new namespace ID.

5. Run the database migrations locally:

```bash
# Run migrations for main database
npm run db:migrate

# Run migrations for auth database
npx wrangler d1 migrations apply AUTH_DB --local
```

Run the development server:

```bash
npm run dev
```

_If you're testing Workflows, you should run `npm run wrangler:dev` instead._

6. Build the application:

```bash
npm run build
```

7. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

8. Run the database migrations remotely:

```bash
# Main database
npm run db:migrate:remote

# Auth database
npx wrangler d1 migrations apply AUTH_DB --remote
```

9. Set your production API token:

```bash
npx wrangler secret put API_TOKEN
```

## Authentication System

The application includes a secure authentication system with the following features:

### 🔐 **Login System**
- **URL**: `/login`
- **Default credentials**: 
  - Email: `admin@example.com`
  - Password: ` `
- Session-based authentication using Cloudflare KV storage
- Automatic redirect to login for protected routes

### 🛡️ **Protected Routes**
The following routes require authentication:
- `/admin` - Main admin dashboard
- `/admin/customers` - Customer management
- `/admin/subscriptions` - Subscription management
- `/admin/groups` - User groups management
- `/api/customers` - Customer API
- `/api/subscriptions` - Subscription API
- `/api/groups` - Groups API
- `/api/users` - Users API

### 🔐 **Permission-Based Access**
The system implements granular permission checking:
- **Resource-based permissions**: customers, subscriptions, admin, groups
- **Action-based permissions**: read, write, delete, admin
- **Group-level inheritance**: Users inherit permissions from their groups

### 👤 **User Management**
- Session management with secure cookies
- Logout functionality at `/logout`
- User information displayed in navigation header

## User Groups & Permissions System

The system includes a comprehensive user groups and role-based access control system:

### 🏢 **Groups Management**
- ✅ Create and manage user groups
- ✅ Add/remove users from groups
- ✅ Assign roles within groups (Admin, Member)
- ✅ Search and filter groups
- ✅ Group descriptions and metadata

### 🔑 **Permission System**
- ✅ Resource-based permissions (customers, subscriptions, admin, groups)
- ✅ Action-based permissions (read, write, delete, admin)
- ✅ Group-level permission inheritance
- ✅ Matrix-based permission management interface
- ✅ Bulk permission updates

### 📊 **Access Control**
- ✅ Role-based navigation visibility
- ✅ API endpoint protection with permission checks
- ✅ Granular permission checking
- ✅ Secure session management
- ✅ Input validation and sanitization

### 🎯 **Key Features**
- **Group Roles**: Admin (full group management) and Member (access-based)
- **Permission Matrix**: Visual interface for managing permissions
- **User Management**: Easy add/remove users with role assignment
- **Security**: All operations protected by authentication and authorization

## Usage

This project includes a fully functional admin dashboard with customer and subscription management capabilities. It also includes an API with token authentication to access resources via REST, returning JSON data.

It also includes a "Customer Workflow", built with [Cloudflare Workflows](https://developers.cloudflare.com/workflows). This workflow can be triggered in the UI or via the REST API to do arbitrary actions in the background for any given user. See [`customer_workflow.ts`]() to learn more about what you can do in this workflow.

## API Endpoints

### 🔐 **Authentication API**
```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "password"
}

# Logout
POST /api/auth/logout
```

### 👥 **Customer API**
```bash
# Get all customers (requires authentication)
GET /api/customers
Authorization: Bearer your_api_token

# Create customer
POST /api/customers
Authorization: Bearer your_api_token
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "VIP customer"
}
```

### 💳 **Subscription API**
```bash
# Get all subscriptions
GET /api/subscriptions
Authorization: Bearer your_api_token

# Create subscription
POST /api/subscriptions
Authorization: Bearer your_api_token
Content-Type: application/json
{
  "name": "Premium Plan",
  "price": 99.99,
  "billing_cycle": "monthly"
}
```

### 👥 **User Groups API**
```bash
# Get all groups
GET /api/groups
Authorization: Bearer your_api_token

# Create group
POST /api/groups
Authorization: Bearer your_api_token
Content-Type: application/json
{
  "name": "Sales Team",
  "description": "Sales and marketing team"
}

# Get group users
GET /api/groups/{id}/users
Authorization: Bearer your_api_token

# Add user to group
POST /api/groups/{id}/users
Authorization: Bearer your_api_token
Content-Type: application/json
{
  "user_id": "user_id",
  "role": "member"
}

# Get group permissions
GET /api/groups/{id}/permissions
Authorization: Bearer your_api_token

# Set group permissions
POST /api/groups/{id}/permissions
Authorization: Bearer your_api_token
Content-Type: application/json
{
  "permissions": [
    {"resource": "customers", "action": "read"},
    {"resource": "customers", "action": "write"}
  ]
}
```

## Development

### 🏗️ **Project Structure**
```
src/
├── components/          # React components
│   ├── admin/          # Admin components
│   │   └── groups/     # User groups components
│   └── ui/             # UI components
├── layouts/            # Astro layouts
├── lib/                # Utilities and services
│   ├── auth.ts         # Authentication utilities
│   └── services/       # Business logic services
│       ├── group.ts    # Group management service
│       ├── user-group.ts # User-group relationships
│       └── group-permission.ts # Permission management
├── pages/              # Astro pages
│   ├── admin/          # Admin dashboard pages
│   │   └── groups/     # User groups pages
│   ├── api/            # API endpoints
│   │   ├── auth/       # Authentication API
│   │   └── groups/     # Groups API
│   ├── login.astro     # Login page
│   └── logout.astro    # Logout page
├── styles/             # Global styles
└── workflows/          # Cloudflare Workflows
```

### 🔧 **Available Scripts**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare Workers
npm run db:migrate       # Run database migrations locally
npm run db:migrate:remote # Run database migrations remotely
```

## Documentation

Complete documentation is available in the `docs/` folder:

- 📖 **[User Guide](docs/UserGuide.md)** - Step-by-step instructions for using the system
- 🔧 **[Developer Guide](docs/DeveloperGuide.md)** - Technical implementation details
- 📊 **[Database Schema](docs/DatabaseSchema.md)** - Database structure and relationships
- 🌐 **[API Documentation](docs/API.md)** - Complete API reference
- 📋 **[Main Documentation](docs/README.md)** - System overview and quick start

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request

## License

This project is licensed under the MIT License.
