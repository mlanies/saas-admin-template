type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    CUSTOMER_WORKFLOW: Workflow;
    DB: D1Database;
    AUTH_DB: D1Database;
    AUTH_STORAGE: KVNamespace;
    user?: {
      userId: string;
      email: string;
      loggedIn: boolean;
      createdAt: string;
    };
  }
}
