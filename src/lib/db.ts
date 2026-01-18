import { PrismaClient } from "~/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { DATABASE_URL } from "@/constants/env";

export const prisma = new PrismaClient({
  accelerateUrl: DATABASE_URL,
}).$extends(withAccelerate());
