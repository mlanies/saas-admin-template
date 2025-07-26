import type { APIRoute } from 'astro';
import { GroupPermissionService } from '@/lib/services/group-permission';
import { validateApiTokenResponse } from '@/lib/api';

export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { API_TOKEN: string; AUTH_DB: D1Database };

    const invalidTokenResponse = await validateApiTokenResponse(
      request,
      API_TOKEN,
    );
    if (invalidTokenResponse) return invalidTokenResponse;

    const groupId = params.id;

    if (!groupId) {
      return new Response(JSON.stringify({ error: 'Group ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const permissionService = new GroupPermissionService(AUTH_DB);
    const permissions = await permissionService.getGroupPermissions(groupId);

    return new Response(JSON.stringify(permissions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching group permissions:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { API_TOKEN: string; AUTH_DB: D1Database };

    const invalidTokenResponse = await validateApiTokenResponse(
      request,
      API_TOKEN,
    );
    if (invalidTokenResponse) return invalidTokenResponse;

    const groupId = params.id;

    if (!groupId) {
      return new Response(JSON.stringify({ error: 'Group ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as { resource: string; action: string }[];
    
    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Expected array of permissions' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate each permission
    for (const permission of body) {
      if (!permission.resource || !permission.action) {
        return new Response(JSON.stringify({ error: 'Each permission must have resource and action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const permissionService = new GroupPermissionService(AUTH_DB);
    
    // Set all permissions for the group
    await permissionService.setGroupPermissions(groupId, body);
    
    // Get the updated permissions
    const permissions = await permissionService.getGroupPermissions(groupId);

    return new Response(JSON.stringify(permissions), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating group permissions:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 