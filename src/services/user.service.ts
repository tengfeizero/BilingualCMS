import bcrypt from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export function listUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.id))
    .all();
}

export function createUser(input: {
  email: string;
  username: string;
  password: string;
  role: string;
}) {
  const hash = bcrypt.hashSync(input.password, 10);
  const result = db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      username: input.username,
      password: hash,
      role: input.role,
    })
    .run();
  return Number(result.lastInsertRowid);
}

export function updateUserRole(id: number, role: string) {
  db.update(users).set({ role }).where(eq(users.id, id)).run();
}

export function toggleUserStatus(id: number) {
  const user = db.select().from(users).where(eq(users.id, id)).get();
  if (!user) return;
  const next = user.status === "active" ? "disabled" : "active";
  db.update(users).set({ status: next }).where(eq(users.id, id)).run();
}

export function countSuperAdmins(): number {
  return (
    db
      .select({ value: users.id })
      .from(users)
      .where(eq(users.role, "super_admin"))
      .all().length
  );
}
