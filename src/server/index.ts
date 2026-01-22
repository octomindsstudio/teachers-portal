import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { examRoutes } from "./routers/exam";
import { categoryRoutes } from "./routers/category";

export const app = new Elysia({ prefix: "/api" })
  .use(swagger())
  .get("/health", () => ({ status: "ok" }))
  .use(examRoutes)
  .use(categoryRoutes);
// We will import and use routes here later

export type App = typeof app;
