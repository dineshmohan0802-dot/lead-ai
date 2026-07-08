import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  json,
  boolean,
  real,
  bigint,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: uuid("supabase_id").notNull().unique(), // UUID from Supabase auth
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: pgEnum("user_role", ["user", "admin"])("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  website: varchar("website", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  employeeSize: varchar("employee_size", { length: 50 }),
  country: varchar("country", { length: 100 }),
  targetCustomer: text("target_customer"),
  keywords: json("keywords").$default(() => []),
  products: json("products").$default(() => []),
  competitors: json("competitors").$default(() => []),
  planId: bigint("plan_id", { mode: "number" }),
  status: pgEnum("org_status", ["active", "suspended", "deleted"])("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  role: pgEnum("member_role", ["owner", "admin", "member"])("role").default("member").notNull(),
  status: pgEnum("member_status", ["active", "invited", "removed"])("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  priceMonthly: integer("price_monthly").notNull(),
  priceYearly: integer("price_yearly").notNull(),
  leadLimit: integer("lead_limit").notNull(),
  platformLimit: integer("platform_limit").notNull(),
  seatLimit: integer("seat_limit").notNull(),
  features: json("features").$default(() => []),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  planId: integer("plan_id").notNull(),
  status: pgEnum("subscription_status", ["trialing", "active", "past_due", "canceled"])("status").default("trialing").notNull(),
  interval: pgEnum("subscription_interval", ["monthly", "yearly"])("interval").default("monthly").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: pgEnum("keyword_type", ["keyword", "competitor", "brand"])("type").default("keyword").notNull(),
  platforms: json("platforms").$default(() => ["all"]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  type: pgEnum("source_type", ["keyword", "competitor", "brand", "account", "subreddit"])("type").default("keyword").notNull(),
  config: json("config").$default(() => ({})),
  isActive: boolean("is_active").default(true).notNull(),
  lastScrapedAt: timestamp("last_scraped_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  sourceId: integer("source_id"),
  platform: varchar("platform", { length: 50 }).notNull(),
  externalId: varchar("external_id", { length: 255 }),
  authorName: varchar("author_name", { length: 255 }),
  authorUsername: varchar("author_username", { length: 255 }),
  authorAvatar: varchar("author_avatar", { length: 500 }),
  authorBio: text("author_bio"),
  title: text("title"),
  content: text("content"),
  url: varchar("url", { length: 500 }),
  intentType: pgEnum("intent_type", [
    "buying_intent", "research_intent", "comparison", "complaint",
    "recommendation", "job_seeking", "general",
  ])("intent_type").default("general").notNull(),
  intentScore: integer("intent_score").default(0).notNull(),
  sentiment: pgEnum("sentiment", [
    "positive", "negative", "neutral", "frustrated",
    "excited", "curious", "urgent", "buying_ready",
  ])("sentiment").default("neutral").notNull(),
  sentimentScore: real("sentiment_score").default(0),
  aiExplanation: text("ai_explanation"),
  companyName: varchar("company_name", { length: 255 }),
  companyWebsite: varchar("company_website", { length: 255 }),
  companyIndustry: varchar("company_industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }),
  companyLocation: varchar("company_location", { length: 100 }),
  jobTitle: varchar("job_title", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  technologies: json("technologies").$default(() => []),
  socialProfiles: json("social_profiles").$default(() => []),
  isEnriched: boolean("is_enriched").default(false).notNull(),
  isBookmarked: boolean("is_bookmarked").default(false).notNull(),
  isContacted: boolean("is_contacted").default(false).notNull(),
  status: pgEnum("lead_status", [
    "new", "qualified", "contacted", "responded", "converted", "archived",
  ])("status").default("new").notNull(),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  discoveredAt: timestamp("discovered_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  leadId: integer("lead_id"),
  userId: integer("user_id"),
  type: pgEnum("activity_type", [
    "lead_discovered", "intent_scored", "enrichment_complete",
    "outreach_sent", "status_changed", "note_added",
  ])("type").notNull(),
  description: text("description"),
  metadata: json("metadata").$default(() => ({})),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outreachTemplates = pgTable("outreach_templates", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: pgEnum("template_type", [
    "cold_email", "linkedin_message", "twitter_dm", "call_script", "follow_up",
  ])("type").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  variables: json("variables").$default(() => []),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedMessages = pgTable("generated_messages", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  leadId: integer("lead_id").notNull(),
  templateId: integer("template_id"),
  type: pgEnum("message_type", [
    "cold_email", "linkedin_message", "twitter_dm", "call_script", "follow_up",
  ])("type").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  aiPrompt: text("ai_prompt"),
  aiModel: varchar("ai_model", { length: 50 }).default("gpt-4"),
  status: pgEnum("message_status", ["draft", "sent", "failed"])("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id"),
  type: pgEnum("notification_type", [
    "hot_lead", "competitor_mention", "funding_alert", "hiring_alert", "intent_spike",
  ])("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("is_read").default(false).notNull(),
  metadata: json("metadata").$default(() => ({})),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const icpProfiles = pgTable("icp_profiles", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  industries: json("industries").$default(() => []),
  companySizes: json("company_sizes").$default(() => []),
  countries: json("countries").$default(() => []),
  revenueRange: varchar("revenue_range", { length: 100 }),
  technologies: json("technologies").$default(() => []),
  departments: json("departments").$default(() => []),
  jobTitles: json("job_titles").$default(() => []),
  buyingKeywords: json("buying_keywords").$default(() => []),
  negativeKeywords: json("negative_keywords").$default(() => []),
  competitorTriggers: json("competitor_triggers").$default(() => []),
  painPoints: json("pain_points").$default(() => []),
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type IcpProfile = typeof icpProfiles.$inferSelect;
export type OutreachTemplate = typeof outreachTemplates.$inferSelect;
export type GeneratedMessage = typeof generatedMessages.$inferSelect;
