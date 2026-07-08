import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const icpRouter = createRouter({
  get: publicQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.icpProfiles)
        .where(eq(schema.icpProfiles.organizationId, input.orgId))
        .limit(1);
      return rows[0] ?? null;
    }),

  upsert: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        industries: z.array(z.string()).optional(),
        companySizes: z.array(z.string()).optional(),
        countries: z.array(z.string()).optional(),
        revenueRange: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        departments: z.array(z.string()).optional(),
        jobTitles: z.array(z.string()).optional(),
        buyingKeywords: z.array(z.string()).optional(),
        negativeKeywords: z.array(z.string()).optional(),
        competitorTriggers: z.array(z.string()).optional(),
        painPoints: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { orgId, ...data } = input;

      const existing = await db
        .select()
        .from(schema.icpProfiles)
        .where(eq(schema.icpProfiles.organizationId, orgId))
        .limit(1);

      const updateData: Record<string, unknown> = {};
      if (data.industries) updateData.industries = JSON.stringify(data.industries);
      if (data.companySizes) updateData.companySizes = JSON.stringify(data.companySizes);
      if (data.countries) updateData.countries = JSON.stringify(data.countries);
      if (data.revenueRange) updateData.revenueRange = data.revenueRange;
      if (data.technologies) updateData.technologies = JSON.stringify(data.technologies);
      if (data.departments) updateData.departments = JSON.stringify(data.departments);
      if (data.jobTitles) updateData.jobTitles = JSON.stringify(data.jobTitles);
      if (data.buyingKeywords) updateData.buyingKeywords = JSON.stringify(data.buyingKeywords);
      if (data.negativeKeywords) updateData.negativeKeywords = JSON.stringify(data.negativeKeywords);
      if (data.competitorTriggers) updateData.competitorTriggers = JSON.stringify(data.competitorTriggers);
      if (data.painPoints) updateData.painPoints = JSON.stringify(data.painPoints);

      if (existing[0]) {
        await db
          .update(schema.icpProfiles)
          .set(updateData)
          .where(eq(schema.icpProfiles.organizationId, orgId));
        return { ...existing[0], ...updateData };
      } else {
        const [result] = await db.insert(schema.icpProfiles).values({
          organizationId: orgId,
          ...updateData,
        }).returning();
        return { id: result.id, orgId, ...updateData };
      }
    }),

  generateAI: publicQuery
    .input(
      z.object({
        organizationDescription: z.string(),
        productDescription: z.string(),
        targetAudience: z.string().optional(),
      })
    )
    .mutation(async () => {
      // Simulated AI generation - in production this would call OpenAI
      const industries = ["Software", "SaaS", "Technology", "Financial Services", "Healthcare"];
      const companySizes = ["10-50", "50-200", "200-1000", "1000-5000"];
      const jobTitles = ["VP of Sales", "Head of Growth", "CEO", " CTO", "Sales Director", "Revenue Operations"];
      const painPoints = [
        "Struggling to find qualified leads",
        "Low conversion rates from cold outreach",
        "Wasting time on manual prospecting",
        "Difficulty identifying buying intent signals",
        "Lack of visibility into competitor activities",
      ];
      const buyingKeywords = [
        "looking for a tool",
        "need a solution",
        "alternative to",
        "recommendation for",
        "best platform for",
        "how to automate",
      ];

      // Select random subset
      const pickRandom = <T>(arr: T[], count: number) => 
        arr.sort(() => Math.random() - 0.5).slice(0, count);

      return {
        industries: pickRandom(industries, 3),
        companySizes: pickRandom(companySizes, 2),
        jobTitles: pickRandom(jobTitles, 4),
        painPoints: pickRandom(painPoints, 4),
        buyingKeywords: pickRandom(buyingKeywords, 4),
        technologies: ["Salesforce", "HubSpot", "Slack", "Zoom"],
        departments: ["Sales", "Marketing", "Revenue Operations"],
        countries: ["United States", "United Kingdom", "Canada"],
        revenueRange: "$1M - $50M",
        aiGenerated: true,
      };
    }),
});
