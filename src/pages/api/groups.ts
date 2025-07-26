import type { APIRoute } from 'astro';
import { GroupService } from '@/lib/services/group';
import { validateApiTokenResponse } from '@/lib/api';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { API_TOKEN: string; AUTH_DB: D1Database };

    const invalidTokenResponse = await validateApiTokenResponse(
      request,
      API_TOKEN,
    );
    if (invalidTokenResponse) return invalidTokenResponse;

    const groupService = new GroupService(AUTH_DB);
    const groups = await groupService.getAll();

    // Add user count for each group
    const groupsWithUserCount = await Promise.all(
      groups.map(async (group) => ({
        ...group,
        users_count: await groupService.getUsersCount(group.id)
      }))
    );

    return new Response(JSON.stringify(groupsWithUserCount), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { API_TOKEN, AUTH_DB } = locals.runtime.env as unknown as { API_TOKEN: string; AUTH_DB: D1Database };

    const invalidTokenResponse = await validateApiTokenResponse(
      request,
      API_TOKEN,
    );
    if (invalidTokenResponse) return invalidTokenResponse;

    const body = await request.json() as { name?: string; description?: string };
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Group name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const groupService = new GroupService(AUTH_DB);
    const group = await groupService.create({
      name: name.trim(),
      description: description?.trim() || undefined
    });

    return new Response(JSON.stringify(group), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 