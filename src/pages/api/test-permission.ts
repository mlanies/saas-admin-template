import type { APIRoute } from 'astro';
import { checkAuth } from '@/lib/auth';
import { GroupPermissionService } from '@/lib/services/group-permission';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const auth = checkAuth(request);
    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { AUTH_DB } = locals.runtime.env as unknown as { AUTH_DB: D1Database };
    const userId = auth.user.id;

    console.log('Testing permission for user:', userId);

    const permissionService = new GroupPermissionService(AUTH_DB);
    
    // Проверяем разрешения пользователя
    const userPermissions = await permissionService.getUserPermissions(userId);
    console.log('User permissions:', userPermissions);

    // Проверяем конкретное разрешение
    const hasGroupsRead = await permissionService.checkUserPermission(userId, 'groups', 'read');
    console.log('Has groups:read permission:', hasGroupsRead);

    return new Response(JSON.stringify({
      userId,
      userPermissions,
      hasGroupsRead,
      message: 'Permission test completed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in test permission:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 