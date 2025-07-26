import type { APIRoute } from 'astro';
import { UserGroupService } from '@/lib/services/user-group';
import { CustomerGroupService } from '@/lib/services/customer-group';
import { validateApiTokenResponse } from '@/lib/api';

export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB, DB } = locals.runtime.env as unknown as { 
      API_TOKEN: string; 
      AUTH_DB: D1Database;
      DB: D1Database;
    };

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

    const userGroupService = new UserGroupService(AUTH_DB);
    const customerGroupService = new CustomerGroupService(AUTH_DB, DB);

    // Get both users and customers in the group
    const [users, customers] = await Promise.all([
      userGroupService.getUsersInGroup(groupId),
      customerGroupService.getCustomersInGroup(groupId)
    ]);

    // Combine results
    const allUsers = [...users, ...customers];

    return new Response(JSON.stringify(allUsers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching group users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB, DB } = locals.runtime.env as unknown as { 
      API_TOKEN: string; 
      AUTH_DB: D1Database;
      DB: D1Database;
    };

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

    const body = await request.json() as { user_id: string; role?: 'admin' | 'member'; user_type?: 'user' | 'customer' };
    const { user_id, role, user_type } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user_type === 'customer') {
      // Handle customer
      const customerGroupService = new CustomerGroupService(AUTH_DB, DB);
      
      // Check if customer is already in the group
      const isAlreadyInGroup = await customerGroupService.isCustomerInGroup(parseInt(user_id), groupId);
      if (isAlreadyInGroup) {
        return new Response(JSON.stringify({ error: 'Customer is already in this group' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const customerGroup = await customerGroupService.addCustomerToGroup(groupId, {
        customer_id: parseInt(user_id),
        role: role || 'member'
      });

      return new Response(JSON.stringify(customerGroup), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Handle user (default)
      const userGroupService = new UserGroupService(AUTH_DB);
      
      // Check if user is already in the group
      const isAlreadyInGroup = await userGroupService.isUserInGroup(user_id, groupId);
      if (isAlreadyInGroup) {
        return new Response(JSON.stringify({ error: 'User is already in this group' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const userGroup = await userGroupService.addUserToGroup(groupId, {
        user_id,
        role: role || 'member'
      });

      return new Response(JSON.stringify(userGroup), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error adding user to group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 