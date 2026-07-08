import { relations } from "drizzle-orm";
import * as schema from "./schema";

export const usersRelations = relations(schema.users, ({ many }) => ({
  members: many(schema.members),
}));

export const organizationsRelations = relations(schema.organizations, ({ many, one }) => ({
  members: many(schema.members),
  leads: many(schema.leads),
  sources: many(schema.sources),
  activities: many(schema.activities),
  keywords: many(schema.keywords),
  notifications: many(schema.notifications),
  subscription: one(schema.subscriptions, {
    fields: [schema.organizations.id],
    references: [schema.subscriptions.organizationId],
  }),
  icpProfile: one(schema.icpProfiles, {
    fields: [schema.organizations.id],
    references: [schema.icpProfiles.organizationId],
  }),
}));

export const membersRelations = relations(schema.members, ({ one }) => ({
  user: one(schema.users, {
    fields: [schema.members.userId],
    references: [schema.users.id],
  }),
  organization: one(schema.organizations, {
    fields: [schema.members.organizationId],
    references: [schema.organizations.id],
  }),
}));
