import { authRouter } from "./auth-router";
import { organizationRouter } from "./organization-router";
import { leadRouter } from "./lead-router";
import { dashboardRouter } from "./dashboard-router";
import { icpRouter } from "./icp-router";
import { outreachRouter } from "./outreach-router";
import { sourceRouter } from "./source-router";
import { notificationRouter } from "./notification-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  organization: organizationRouter,
  lead: leadRouter,
  dashboard: dashboardRouter,
  icp: icpRouter,
  outreach: outreachRouter,
  source: sourceRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
