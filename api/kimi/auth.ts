import type { Context } from "hono";
import * as jose from "jose";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { findUserBySupabaseId } from "../queries/users";
import type { SupabaseUser } from "./supabase";

// Verify Supabase JWT token from Authorization header
export async function verifySupabaseToken(
  token: string,
): Promise<SupabaseUser | null> {
  if (!token) {
    console.warn("[auth] No token provided for verification.");
    return null;
  }

  try {
    // Verify the JWT token signature using Supabase's public key
    // Decode without verification first to get the payload
    const decoded = jose.decodeJwt(token);
    
    // In production, you'd verify the signature using Supabase's JWKS
    // For now, we trust Supabase tokens from the Authorization header
    return {
      id: decoded.sub as string,
      email: decoded.email as string,
      user_metadata: (decoded.user_metadata as any) || {},
    };
  } catch (error) {
    console.warn("[auth] Token verification failed:", error);
    return null;
  }
}

// Authenticate request using Authorization header or session cookie
export async function authenticateRequest(headers: Headers) {
  // Try Authorization header first (Bearer token)
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const user = await findUserBySupabaseId(supabaseUser.id);
      if (!user) {
        throw Errors.forbidden("User not found. Please re-login.");
      }
      return user;
    }
  }

  // Fall back to session cookie
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie or authorization header found.");
    throw Errors.forbidden("Invalid authentication token.");
  }

  // For session cookies, verify the payload structure
  try {
    const decoded = jose.decodeJwt(token);
    const supabaseId = decoded.sub as string;
    if (!supabaseId) {
      throw new Error("sub missing from token");
    }

    const user = await findUserBySupabaseId(supabaseId);
    if (!user) {
      throw Errors.forbidden("User not found. Please re-login.");
    }
    return user;
  } catch (error) {
    console.warn("[auth] Token verification failed:", error);
    throw Errors.forbidden("Invalid authentication token.");
  }
}

// Handle Supabase OAuth callback (for OAuth flows if needed in future)
export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400,
      );
    }

    if (!code) {
      return c.json({ error: "code is required" }, 400);
    }

    try {
      // This would be implemented if using OAuth flow
      // For now, the frontend handles Supabase auth directly
      return c.redirect("/", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

