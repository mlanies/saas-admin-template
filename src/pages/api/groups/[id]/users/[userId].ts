import type { APIRoute } from 'astro';
import { UserGroupService } from '@/lib/services/user-group';
import { checkAuth, requirePermission } from '@/lib/auth';

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const auth = checkAuth(request);
    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const userId = auth.user.id;
    const groupId = params.id;
    const targetUserId = params.userId;

    if (!groupId || !targetUserId) {
      return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permission to edit groups
    try {
      await requirePermission(DB, userId, 'groups', 'write');
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userGroupService = new UserGroupService(DB);
    const success = await userGroupService.removeUserFromGroup(groupId, targetUserId);

    if (!success) {
      return new Response(JSON.stringify({ error: 'User not found in group' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'User removed from group successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error removing user from group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const auth = checkAuth(request);
    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const userId = auth.user.id;
    const groupId = params.id;
    const targetUserId = params.userId;

    if (!groupId || !targetUserId) {
      return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permission to edit groups
    try {
      await requirePermission(DB, userId, 'groups', 'write');
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as { role: 'admin' | 'member' };
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Valid role is required (admin or member)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userGroupService = new UserGroupService(DB);
    const userGroup = await userGroupService.updateUserRole(groupId, targetUserId, role);

    if (!userGroup) {
      return new Response(JSON.stringify({ error: 'User not found in group' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(userGroup), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 