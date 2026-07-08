import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const outreachRouter = createRouter({
  listTemplates: publicQuery
    .input(z.object({ orgId: z.number(), type: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input ?? { orgId: 1 };
      const conditions = [eq(schema.outreachTemplates.organizationId, filters.orgId)];
      if (filters.type) {
        conditions.push(eq(schema.outreachTemplates.type, filters.type as "cold_email" | "linkedin_message" | "twitter_dm" | "call_script" | "follow_up"));
      }
      return db
        .select()
        .from(schema.outreachTemplates)
        .where(eq(schema.outreachTemplates.organizationId, filters.orgId))
        .orderBy(desc(schema.outreachTemplates.createdAt));
    }),

  createTemplate: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        name: z.string(),
        type: z.enum(["cold_email", "linkedin_message", "twitter_dm", "call_script", "follow_up"]),
        subject: z.string().optional(),
        body: z.string(),
        variables: z.array(z.string()).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(schema.outreachTemplates).values({
        organizationId: input.orgId,
        name: input.name,
        type: input.type,
        subject: input.subject,
        body: input.body,
        variables: JSON.stringify(input.variables ?? []),
        isDefault: input.isDefault ?? false,
      }).returning();
      return { id: result.id, ...input };
    }),

  generateMessage: publicQuery
    .input(
      z.object({
        orgId: z.number(),
        leadId: z.number(),
        type: z.enum(["cold_email", "linkedin_message", "twitter_dm", "call_script", "follow_up"]),
        templateId: z.number().optional(),
        customInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      const lead = await db
        .select()
        .from(schema.leads)
        .where(eq(schema.leads.id, input.leadId))
        .limit(1);

      if (!lead[0]) return null;

      const l = lead[0];
      const templates: Record<string, Record<string, string>> = {
        cold_email: {
          subject: `Quick question about {{company}}'s {{topic}}`,
          body: `Hi {{name}},\n\nI noticed your post about {{context}}. I work with {{companyType}} teams to help them {{valueProp}}.\n\nWould you be open to a brief conversation about how we might help {{company}}?\n\nBest,\n[Your Name]`,
        },
        linkedin_message: {
          subject: "",
          body: `Hi {{name}}, saw your post about {{context}}. We help {{companyType}} teams {{valueProp}} — would love to connect and share how {{company}} could benefit. Interested in a quick chat?`,
        },
        twitter_dm: {
          subject: "",
          body: `Hey {{name}}! Saw your tweet about {{context}}. We built something that helps with exactly that. Mind if I share a quick demo?`,
        },
        call_script: {
          subject: "Call Script",
          body: `Opening: "Hi {{name}}, this is [Your Name] from [Company]. I saw your recent post about {{context}}..."\n\nValue Prop: "We specialize in helping {{companyType}} teams like {{company}} to {{valueProp}}..."\n\nQuestions:\n- "What's your current process for {{topic}}?"\n- "How is that working for you?"\n- "What would an ideal solution look like?"\n\nClose: "Would it make sense to schedule a 15-minute demo this week?"`,
        },
        follow_up: {
          subject: `Following up: {{company}} + [Your Company]`,
          body: `Hi {{name}},\n\nJust following up on my previous message. I know things get busy!\n\nTo recap: we help {{companyType}} teams {{valueProp}}, and I thought there might be a fit with {{company}}.\n\nWorth a brief conversation?\n\nBest,\n[Your Name]`,
        },
      };

      const tmpl = templates[input.type];
      const context = l.content?.substring(0, 200) ?? "your recent activity";
      const topic = l.companyIndustry ?? "growth";
      const companyType = l.companyIndustry ?? "B2B";
      const valueProp = "find and engage high-intent prospects";

      let body = tmpl.body
        .replace(/\{\{name\}\}/g, l.authorName ?? "there")
        .replace(/\{\{company\}\}/g, l.companyName ?? "your company")
        .replace(/\{\{context\}\}/g, context)
        .replace(/\{\{topic\}\}/g, topic)
        .replace(/\{\{companyType\}\}/g, companyType)
        .replace(/\{\{valueProp\}\}/g, valueProp);

      let subject = tmpl.subject
        .replace(/\{\{name\}\}/g, l.authorName ?? "there")
        .replace(/\{\{company\}\}/g, l.companyName ?? "your company")
        .replace(/\{\{context\}\}/g, context)
        .replace(/\{\{topic\}\}/g, topic);

      if (input.customInstructions) {
        body += `\n\n[Custom instructions applied: ${input.customInstructions}]`;
      }

      const [result] = await db.insert(schema.generatedMessages).values({
        organizationId: input.orgId,
        leadId: input.leadId,
        templateId: input.templateId,
        type: input.type,
        subject: subject || null,
        body,
        aiModel: "gpt-4",
        status: "draft",
      }).returning();

      return {
        id: result.id,
        subject,
        body,
        type: input.type,
      };
    }),

  listMessages: publicQuery
    .input(z.object({ orgId: z.number(), leadId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input ?? { orgId: 1 };
      const conditions = [eq(schema.generatedMessages.organizationId, filters.orgId)];
      if (filters.leadId) {
        conditions.push(eq(schema.generatedMessages.leadId, filters.leadId));
      }
      return db
        .select()
        .from(schema.generatedMessages)
        .where(eq(schema.generatedMessages.organizationId, filters.orgId))
        .orderBy(desc(schema.generatedMessages.createdAt))
        .limit(50);
    }),
});
