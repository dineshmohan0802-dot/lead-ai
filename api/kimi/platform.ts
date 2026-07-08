import type { UserProfile } from "./types";

// Kimi OAuth integration is deprecated - using Supabase instead
// This file is kept for backward compatibility only

async function kimiRequest<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T | null> {
  console.warn(
    "[kimi] Kimi API requests are deprecated - using Supabase for authentication",
  );
  return null;
}

export const users = {
  getProfile: (token: string) => {
    console.warn(
      "[kimi] getProfile is deprecated - use Supabase user profile instead",
    );
    return kimiRequest<UserProfile>("/v1/users/me/profile", token);
  },
};
