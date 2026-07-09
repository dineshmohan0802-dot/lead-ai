import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "@db/schema";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ orgId: z.number(), limit: z.number().default(20), unreadOnly: z.boolean().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(schema.notifications.organizationId, input.orgId)];
      if (input.unreadOnly) {
        conditions.push(eq(schema.notifications.isRead, false));
      }
      return db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.organizationId, input.orgId))
        .orderBy(desc(schema.notifications.createdAt))
        .limit(input.limit);
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicQuery
    .input(z.object({ orgId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.organizationId, input.orgId));
      return { success: true };
    }),

  create: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        type: z.enum(["hot_lead", "competitor_mention", "funding_alert", "hiring_alert", "intent_spike"]),
        title: z.string(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(schema.notifications).values({
        organizationId: input.orgId,
        type: input.type,
        title: input.title,
        message: input.message,
      }).returning();
      return { id: result.id, ...input };
    }),
});
