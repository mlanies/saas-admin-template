import type { APIRoute } from 'astro';
import { validateApiTokenResponse } from '@/lib/api';

export const GET: APIRoute = async ({ request, locals }) => {
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

    // Get users from auth table
    const authUsers = await AUTH_DB
      .prepare('SELECT id, email, created_at FROM user ORDER BY created_at DESC')
      .all<{ id: string; email: string; created_at: string }>();

    // Get customers from customers table
    const customers = await DB
      .prepare('SELECT id, email, created_at FROM customers ORDER BY created_at DESC')
      .all<{ id: string; email: string; created_at: string }>();

    // Combine and format users
    const allUsers = [
      ...(authUsers.results || []).map(user => ({
        ...user,
        type: 'user'
      })),
      ...(customers.results || []).map(customer => ({
        id: customer.id.toString(),
        email: customer.email,
        created_at: customer.created_at,
        type: 'customer'
      }))
    ];

    return new Response(JSON.stringify(allUsers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 