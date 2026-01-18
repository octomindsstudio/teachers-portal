import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { examRoutes } from "./routers/exam";

export const app = new Elysia({ prefix: "/api" })
  .use(swagger())
  .get("/health", () => ({ status: "ok" }))
  .use(examRoutes);

// We will import and use routes here later

export type App = typeof app;
