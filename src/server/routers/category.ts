import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Elysia, t } from "elysia";

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .get("/", async ({ request, status }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return status(401, "Unauthorized");

    return await prisma.category.findMany({
      where: { teacherId: session.user.id },
      orderBy: { name: "asc" },
    });
  })
  .post(
    "/",
    async ({ body, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) return status(401, "Unauthorized");

      const { name } = body;

      try {
        const category = await prisma.category.create({
          data: {
            name,
            teacherId: session.user.id,
          },
        });
        return category;
      } catch (e) {
        return status(400, "Category already exists or failed to create");
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) return status(401, "Unauthorized");

      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.teacherId !== session.user.id) {
        return status(404, "Category not found");
      }

      await prisma.category.delete({ where: { id } });
      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
    },
  );
