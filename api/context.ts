import type { Context } from "hono";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth.js";

export interface TrpcContext {
  c: Context;
  user: User | null;
  orgId: number | null;
}

export async function createContext({ req }: { req: Request }): Promise<TrpcContext> {
  try {
    const user = await authenticateRequest(req.headers);
    return { c: null as unknown as Context, user, orgId: null };
  } catch {
    return { c: null as unknown as Context, user: null, orgId: null };
  }
}
