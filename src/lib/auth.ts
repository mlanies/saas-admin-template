import { GroupPermissionService } from './services/group-permission';
import { UserGroupService } from './services/user-group';

export function checkAuth(request: Request): { isAuthenticated: boolean; user?: any } {
  const sessionCookie = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionCookie) {
    return { isAuthenticated: false };
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie));
    
    if (!session.loggedIn) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, user: session };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export function redirectToLogin(url: URL): Response {
  return Response.redirect(new URL('/login', url.origin));
}

export async function checkPermission(
  db: D1Database, 
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  const permissionService = new GroupPermissionService(db);
  return await permissionService.checkUserPermission(userId, resource, action);
}

export async function getUserPermissions(db: D1Database, userId: string): Promise<{ resource: string; action: string }[]> {
  const permissionService = new GroupPermissionService(db);
  return await permissionService.getUserPermissions(userId);
}

export async function getUserGroups(db: D1Database, userId: string): Promise<{ group_id: string; role: string }[]> {
  const userGroupService = new UserGroupService(db);
  return await userGroupService.getUserGroups(userId);
}

export async function hasPermission(
  db: D1Database, 
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  return await checkPermission(db, userId, resource, action);
}

export async function requirePermission(
  db: D1Database, 
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  const hasAccess = await hasPermission(db, userId, resource, action);
  if (!hasAccess) {
    throw new Error(`Access denied: ${action} permission required for ${resource}`);
  }
  return true;
} 