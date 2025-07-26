import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({
    success: true,
    message: "Logout successful"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  });
}; 