import { z } from "zod";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "@db/schema";

export const dashboardRouter = createRouter({
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
        .where(and(orgCondition, gte(schema.leads.intentScore, 40), sql`${schema.leads.intentScore} < 70`));

      const lowIntentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, sql`${schema.leads.intentScore} < 40`));

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const newTodayResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, gte(schema.leads.createdAt, todayStart)));

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newThisWeekResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(orgCondition, gte(schema.leads.createdAt, weekAgo)));

      const byPlatform = await db
        .select({
          platform: schema.leads.platform,
          count: sql<number>`count(*)`,
        })
        .from(schema.leads)
        .where(orgCondition)
        .groupBy(schema.leads.platform);

      const byIntent = await db
        .select({
          intentType: schema.leads.intentType,
          count: sql<number>`count(*)`,
        })
        .from(schema.leads)
        .where(orgCondition)
        .groupBy(schema.leads.intentType);

      const recentActivities = await db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.organizationId, input.orgId))
        .orderBy(desc(schema.activities.createdAt))
        .limit(10);

      return {
        totalLeads: totalResult[0]?.count ?? 0,
        highIntent: highIntentResult[0]?.count ?? 0,
        mediumIntent: mediumIntentResult[0]?.count ?? 0,
        lowIntent: lowIntentResult[0]?.count ?? 0,
        newToday: newTodayResult[0]?.count ?? 0,
        newThisWeek: newThisWeekResult[0]?.count ?? 0,
        byPlatform,
        byIntent,
        recentActivities,
      };
    }),

  intentTimeline: publicQuery
    .input(z.object({ orgId: z.number(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = getDb();
      const daysAgo = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      
      const timeline = await db
        .select({
          date: sql<string>`DATE(${schema.leads.createdAt})`,
          count: sql<number>`count(*)`,
          avgScore: sql<number>`AVG(${schema.leads.intentScore})`,
        })
        .from(schema.leads)
        .where(
          and(
            eq(schema.leads.organizationId, input.orgId),
            gte(schema.leads.createdAt, daysAgo)
          )
        )
        .groupBy(sql`DATE(${schema.leads.createdAt})`)
        .orderBy(sql`DATE(${schema.leads.createdAt})`);

      return timeline;
    }),

  trendingTopics: publicQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const leads = await db
        .select({ content: schema.leads.content, title: schema.leads.title })
        .from(schema.leads)
        .where(eq(schema.leads.organizationId, input.orgId))
        .orderBy(desc(schema.leads.createdAt))
        .limit(100);

      const wordCounts = new Map<string, number>();
      const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can", "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below", "between", "out", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "and", "but", "if", "or", "because", "until", "while", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "it", "its", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "they", "them", "their"]);

      for (const lead of leads) {
        const text = `${lead.title ?? ""} ${lead.content ?? ""}`.toLowerCase();
        const words = text.match(/[a-z]{3,}/g) ?? [];
        for (const word of words) {
          if (!stopWords.has(word) && word.length > 3) {
            wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
          }
        }
      }

      return Array.from(wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }));
    }),
});
