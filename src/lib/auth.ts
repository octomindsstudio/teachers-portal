import { prisma } from "./db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, teacher, user } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },

  plugins: [
    adminPlugin({
      defaultRole:"teacher",
      ac,
      roles: {
        admin,
        user,
        teacher,
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },

  trustedOrigins: ["*"],
});
