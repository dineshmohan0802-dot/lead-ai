import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserBySupabaseId(supabaseId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.supabaseId, supabaseId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.supabaseId &&
    values.supabaseId === env.ownerUserId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({
      target: schema.users.supabaseId,
      set: updateSet,
    });
}

// Keep old function for backward compatibility (can be removed later)
export async function findUserByUnionId(_unionId: string) {
  console.warn(
    "[deprecated] findUserByUnionId is deprecated, use findUserBySupabaseId instead",
  );
  return null;
}

