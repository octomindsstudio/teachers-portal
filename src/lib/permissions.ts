import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  exam: ["create", "read", "update", "delete"],
  attempt: ["create", "read"],
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
  ...adminAc.statements,
  // Custom resources
  exam: ["create", "read", "update", "delete"],
  attempt: ["create", "read"],
});

const teacher = ac.newRole({
  exam: ["create", "read", "update", "delete"],
  attempt: ["read"],
});

const user = ac.newRole({
  exam: ["read"],
  attempt: ["create", "read"],
});

export { ac, admin, teacher, user };
