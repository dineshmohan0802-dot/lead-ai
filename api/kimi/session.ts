import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

// Session handling using Supabase JWT - old Kimi session is deprecated
// This file is kept for backward compatibility only

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  // Use Supabase service key for signing (split to get the secret part)
  const secret = new TextEncoder().encode(
    env.supabaseServiceKey.split(".")[1] || "dev-secret-key"
  );
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(
      env.supabaseServiceKey.split(".")[1] || "dev-secret-key"
    );
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId } as SessionPayload;
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
