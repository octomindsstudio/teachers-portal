import { treaty } from "@elysiajs/eden";
import type { App } from "@/server";

/* 
  If we are on the client, use the current origin.
  If we are on the server (SSR), use the environment variable or default to localhost.
*/
const url =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.BASE_URL || "http://localhost:3000";

export const api = treaty<App>(url).api;
