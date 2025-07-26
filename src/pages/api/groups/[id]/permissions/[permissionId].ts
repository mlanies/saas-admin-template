import type { APIRoute } from 'astro';
import { GroupPermissionService } from '@/lib/services/group-permission';
import { checkAuth, requirePermission } from '@/lib/auth';
import { validateApiTokenResponse } from '@/lib/api';

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { API_TOKEN: string; AUTH_DB: D1Database };
    
    // Check API token first
    const invalidTokenResponse = await validateApiTokenResponse(request, API_TOKEN);
    if (!invalidTokenResponse) {
      // API token is valid, proceed with API token authentication
      const groupId = params.id;
      const permissionId = params.permissionId;

      if (!groupId || !permissionId) {
        return new Response(JSON.stringify({ error: 'Group ID and Permission ID are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const permissionService = new GroupPermissionService(AUTH_DB);
      const success = await permissionService.removePermission(groupId, permissionId);

      if (!success) {
        return new Response(JSON.stringify({ error: 'Permission not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ message: 'Permission removed successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fall back to session authentication
    const auth = checkAuth(request);
    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = auth.user.id;
    const groupId = params.id;
    const permissionId = params.permissionId;

    if (!groupId || !permissionId) {
      return new Response(JSON.stringify({ error: 'Group ID and Permission ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permission to edit groups
    try {
      await requirePermission(AUTH_DB, userId, 'groups', 'write');
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const permissionService = new GroupPermissionService(AUTH_DB);
    const success = await permissionService.removePermission(groupId, permissionId);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Permission removed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error removing group permission:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 