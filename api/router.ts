import { authRouter } from "./auth-router.js";
import { organizationRouter } from "./organization-router.js";
import { leadRouter } from "./lead-router.js";
import { dashboardRouter } from "./dashboard-router.js";
import { icpRouter } from "./icp-router.js";
import { outreachRouter } from "./outreach-router.js";
import { sourceRouter } from "./source-router.js";
import { notificationRouter } from "./notification-router.js";
import { createRouter, publicQuery } from "./middleware.js";

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
