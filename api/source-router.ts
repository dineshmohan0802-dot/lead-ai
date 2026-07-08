import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const sourceRouter = createRouter({
  list: publicQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.sources)
        .where(eq(schema.sources.organizationId, input.orgId))
        .orderBy(desc(schema.sources.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        name: z.string(),
        platform: z.string(),
        type: z.enum(["keyword", "competitor", "brand", "account", "subreddit"]),
        config: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(schema.sources).values({
        organizationId: input.orgId,
        name: input.name,
        platform: input.platform,
        type: input.type,
        config: JSON.stringify(input.config ?? {}),
      }).returning();
      return { id: result.id, ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.config) updateData.config = JSON.stringify(updates.config);
      
      await db
        .update(schema.sources)
        .set(updateData)
        .where(eq(schema.sources.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.sources).where(eq(schema.sources.id, input.id));
      return { success: true };
    }),
});
