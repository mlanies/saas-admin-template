import type { APIRoute } from 'astro';
import { GroupService } from '@/lib/services/group';
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

    const groupService = new GroupService(AUTH_DB);
    const group = await groupService.getById(groupId);

    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(group), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    const body = await request.json() as { name?: string; description?: string };
    const { name, description } = body;

    const groupService = new GroupService(AUTH_DB);
    const group = await groupService.update(groupId, {
      name: name?.trim(),
      description: description?.trim()
    });

    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(group), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
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

    const groupService = new GroupService(AUTH_DB);
    const success = await groupService.delete(groupId);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Group deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 