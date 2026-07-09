import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { createRouter, authedQuery } from "./middleware.js";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async () => {
    // Use default cookie options (secure cookies configured in production)
    const opts = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };
    
    const setCookieHeader = cookie.serialize(Session.cookieName, "", {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite,
      secure: opts.secure,
      maxAge: 0,
    });

    return { 
      success: true,
      // Return the cookie header that should be set by the client/middleware
      setCookieHeader,
    };
  }),
});
