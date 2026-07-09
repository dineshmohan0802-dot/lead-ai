import { z } from "zod";
import { eq, desc, and, gte, lte, sql, like, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "@db/schema";

export const leadRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        platform: z.string().optional(),
        intentType: z.string().optional(),
        sentiment: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        bookmarked: z.boolean().optional(),
        scoreMin: z.number().optional(),
        scoreMax: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input ?? { orgId: 1, limit: 20 };
      const conditions = [eq(schema.leads.organizationId, filters.orgId)];

      if (filters.platform) conditions.push(eq(schema.leads.platform, filters.platform));
      if (filters.intentType) conditions.push(eq(schema.leads.intentType, filters.intentType as "buying_intent" | "research_intent" | "comparison" | "complaint" | "recommendation" | "job_seeking" | "general"));
      if (filters.sentiment) conditions.push(eq(schema.leads.sentiment, filters.sentiment as "positive" | "negative" | "neutral" | "frustrated" | "excited" | "curious" | "urgent" | "buying_ready"));
      if (filters.status) conditions.push(eq(schema.leads.status, filters.status as "new" | "qualified" | "contacted" | "responded" | "converted" | "archived"));
      if (filters.bookmarked !== undefined) conditions.push(eq(schema.leads.isBookmarked, filters.bookmarked));
      if (filters.scoreMin !== undefined) conditions.push(gte(schema.leads.intentScore, filters.scoreMin));
      if (filters.scoreMax !== undefined) conditions.push(lte(schema.leads.intentScore, filters.scoreMax));
      if (filters.search) {
        conditions.push(
          or(
            like(schema.leads.authorName, `%${filters.search}%`),
            like(schema.leads.companyName, `%${filters.search}%`),
            like(schema.leads.content, `%${filters.search}%`),
            like(schema.leads.title, `%${filters.search}%`)
          )!
        );
      }

      const leads = await db
        .select()
        .from(schema.leads)
        .where(and(...conditions))
        .orderBy(desc(schema.leads.createdAt))
        .limit(filters.limit + 1);

      let nextCursor: number | undefined;
      if (leads.length > filters.limit) {
        const nextItem = leads.pop();
        nextCursor = nextItem?.id;
      }

      return { leads, nextCursor };
    }),

  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, input.id))
        .limit(1);
      
      if (!rows[0]) return null;

      const activities = await db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.leadId, input.id))
        .orderBy(desc(schema.activities.createdAt))
        .limit(20);

      const messages = await db
        .select()
        .from(schema.generatedMessages)
        .where(eq(schema.generatedMessages.leadId, input.id))
        .orderBy(desc(schema.generatedMessages.createdAt))
        .limit(10);

      return { ...rows[0], activities, messages };
    }),

  updateStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(schema.leads)
        .set({ status: input.status as "new" | "qualified" | "contacted" | "responded" | "converted" | "archived" })
        .where(eq(schema.leads.id, input.id));
      return { success: true };
    }),

  toggleBookmark: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({ isBookmarked: schema.leads.isBookmarked })
        .from(schema.leads)
        .where(eq(schema.leads.id, input.id))
        .limit(1);
      
      if (rows[0]) {
        await db
          .update(schema.leads)
          .set({ isBookmarked: !rows[0].isBookmarked })
          .where(eq(schema.leads.id, input.id));
      }
      return { success: true };
    }),

  stats: publicQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orgCondition = eq(schema.leads.organizationId, input.orgId);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(orgCondition);

      const highIntentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, gte(schema.leads.intentScore, 70)));

      const mediumIntentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, gte(schema.leads.intentScore, 40), lte(schema.leads.intentScore, 69)));

      const lowIntentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, lte(schema.leads.intentScore, 39)));

      const newThisWeekResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, gte(schema.leads.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))));

      return {
        totalLeads: totalResult[0]?.count ?? 0,
        highIntent: highIntentResult[0]?.count ?? 0,
        mediumIntent: mediumIntentResult[0]?.count ?? 0,
        lowIntent: lowIntentResult[0]?.count ?? 0,
        newThisWeek: newThisWeekResult[0]?.count ?? 0,
      };
    }),
});
