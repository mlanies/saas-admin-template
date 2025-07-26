import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;

    // Простая проверка (в реальном приложении нужно хешировать пароли)
    if (email === "admin@example.com" && password === "password") {
      // Создаем сессию
      const session = {
        userId: "1",
        email: email,
        loggedIn: true,
        createdAt: new Date().toISOString()
      };

      // Сохраняем в KV (в реальном приложении)
      // await locals.AUTH_STORAGE.put(`session:${session.userId}`, JSON.stringify(session));

      return new Response(JSON.stringify({
        success: true,
        message: "Login successful",
        user: { id: session.userId, email: session.email }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${JSON.stringify(session)}; HttpOnly; Path=/; Max-Age=3600`
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid credentials"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Server error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}; 