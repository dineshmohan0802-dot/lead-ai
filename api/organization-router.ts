import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const organizationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userOrgs = await db
      .select({
        id: schema.organizations.id,
        name: schema.organizations.name,
        slug: schema.organizations.slug,
        industry: schema.organizations.industry,
        status: schema.organizations.status,
        role: schema.members.role,
      })
      .from(schema.members)
      .innerJoin(
        schema.organizations,
        eq(schema.members.organizationId, schema.organizations.id)
      )
      .where(eq(schema.members.userId, ctx.user.id));
    return userOrgs;
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        website: z.string().max(255).optional(),
        industry: z.string().max(100).optional(),
        employeeSize: z.string().max(50).optional(),
        country: z.string().max(100).optional(),
        targetCustomer: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        products: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const [org] = await db.insert(schema.organizations).values({
        name: input.name,
        slug: input.slug,
        website: input.website,
        industry: input.industry,
        employeeSize: input.employeeSize,
        country: input.country,
        targetCustomer: input.targetCustomer,
        keywords: JSON.stringify(input.keywords ?? []),
        products: JSON.stringify(input.products ?? []),
        competitors: JSON.stringify(input.competitors ?? []),
      }).returning();

      const orgId = org.id;

      await db.insert(schema.members).values({
        organizationId: orgId,
        userId: ctx.user.id,
        role: "owner",
      });

      await db.insert(schema.subscriptions).values({
        organizationId: orgId,
        planId: 1,
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      return { id: orgId, ...input };
    }),

  get: authedQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: schema.organizations.id,
          name: schema.organizations.name,
          slug: schema.organizations.slug,
          website: schema.organizations.website,
          industry: schema.organizations.industry,
          employeeSize: schema.organizations.employeeSize,
          country: schema.organizations.country,
          targetCustomer: schema.organizations.targetCustomer,
          keywords: schema.organizations.keywords,
          products: schema.organizations.products,
          competitors: schema.organizations.competitors,
          status: schema.organizations.status,
          role: schema.members.role,
          planName: schema.plans.name,
          subscriptionStatus: schema.subscriptions.status,
          trialEndsAt: schema.subscriptions.trialEndsAt,
        })
        .from(schema.organizations)
        .innerJoin(
          schema.members,
          eq(schema.members.organizationId, schema.organizations.id)
        )
        .leftJoin(
          schema.subscriptions,
          eq(schema.subscriptions.organizationId, schema.organizations.id)
        )
        .leftJoin(
          schema.plans,
          eq(schema.plans.id, schema.subscriptions.planId)
        )
        .where(eq(schema.organizations.slug, input.slug))
        .limit(1);

      return rows[0] ?? null;
    }),

  update: authedQuery
    .input(
      z.object({
        slug: z.string(),
        name: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        employeeSize: z.string().optional(),
        country: z.string().optional(),
        targetCustomer: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        products: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { slug, ...updates } = input;
      
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.website) updateData.website = updates.website;
      if (updates.industry) updateData.industry = updates.industry;
      if (updates.employeeSize) updateData.employeeSize = updates.employeeSize;
      if (updates.country) updateData.country = updates.country;
      if (updates.targetCustomer) updateData.targetCustomer = updates.targetCustomer;
      if (updates.keywords) updateData.keywords = JSON.stringify(updates.keywords);
      if (updates.products) updateData.products = JSON.stringify(updates.products);
      if (updates.competitors) updateData.competitors = JSON.stringify(updates.competitors);

      await db
        .update(schema.organizations)
        .set(updateData)
        .where(eq(schema.organizations.slug, slug));

      return { success: true };
    }),
});
