import type { APIRoute } from 'astro';
import { UserGroupService } from '@/lib/services/user-group';
import { CustomerGroupService } from '@/lib/services/customer-group';
import { checkAuth, requirePermission } from '@/lib/auth';
import { validateApiTokenResponse } from '@/lib/api';

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB, DB } = locals.runtime.env as unknown as { 
      API_TOKEN: string; 
      AUTH_DB: D1Database;
      DB: D1Database;
    };
    
    // Check API token first
    const invalidTokenResponse = await validateApiTokenResponse(request, API_TOKEN);
    if (!invalidTokenResponse) {
      // API token is valid, proceed with API token authentication
      const groupId = params.id;
      const targetUserId = params.userId;

      if (!groupId || !targetUserId) {
        return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Try to remove as user first, then as customer
      const userGroupService = new UserGroupService(AUTH_DB);
      const customerGroupService = new CustomerGroupService(AUTH_DB, DB);

      let success = await userGroupService.removeUserFromGroup(groupId, targetUserId);
      
      if (!success) {
        // Try as customer
        success = await customerGroupService.removeCustomerFromGroup(groupId, parseInt(targetUserId));
      }

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
    const targetUserId = params.userId;

    if (!groupId || !targetUserId) {
      return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
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

    const userGroupService = new UserGroupService(AUTH_DB);
    const customerGroupService = new CustomerGroupService(AUTH_DB, DB);

    let success = await userGroupService.removeUserFromGroup(groupId, targetUserId);
    
    if (!success) {
      // Try as customer
      success = await customerGroupService.removeCustomerFromGroup(groupId, parseInt(targetUserId));
    }

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
    const { API_TOKEN, AUTH_DB, DB } = locals.runtime.env as unknown as { 
      API_TOKEN: string; 
      AUTH_DB: D1Database;
      DB: D1Database;
    };
    
    // Check API token first
    const invalidTokenResponse = await validateApiTokenResponse(request, API_TOKEN);
    if (!invalidTokenResponse) {
      // API token is valid, proceed with API token authentication
      const groupId = params.id;
      const targetUserId = params.userId;

      if (!groupId || !targetUserId) {
        return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
          status: 400,
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

      const userGroupService = new UserGroupService(AUTH_DB);
      const customerGroupService = new CustomerGroupService(AUTH_DB, DB);

      // Try to update as user first, then as customer
      let userGroup = await userGroupService.updateUserRole(groupId, targetUserId, role);
      
      if (!userGroup) {
        // Try as customer
        const customerGroup = await customerGroupService.updateCustomerRole(groupId, parseInt(targetUserId), role);
        if (customerGroup) {
          userGroup = {
            id: customerGroup.id,
            user_id: customerGroup.customer_id.toString(),
            group_id: customerGroup.group_id,
            role: customerGroup.role,
            joined_at: customerGroup.joined_at
          } as any;
        }
      }

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
    const targetUserId = params.userId;

    if (!groupId || !targetUserId) {
      return new Response(JSON.stringify({ error: 'Group ID and User ID are required' }), {
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

    const body = await request.json() as { role: 'admin' | 'member' };
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Valid role is required (admin or member)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userGroupService = new UserGroupService(AUTH_DB);
    const customerGroupService = new CustomerGroupService(AUTH_DB, DB);

    // Try to update as user first, then as customer
    let userGroup = await userGroupService.updateUserRole(groupId, targetUserId, role);
    
    if (!userGroup) {
      // Try as customer
      const customerGroup = await customerGroupService.updateCustomerRole(groupId, parseInt(targetUserId), role);
      if (customerGroup) {
        userGroup = {
          id: customerGroup.id,
          user_id: customerGroup.customer_id.toString(),
          group_id: customerGroup.group_id,
          role: customerGroup.role,
          joined_at: customerGroup.joined_at
        } as any;
      }
    }

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