import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

class SupabaseAuthSingleton {
  private static instance: SupabaseAuthSingleton;
  private supabase = createClient();
  private cachedUser: User | null = null;
  private userPromise: Promise<{ data: { user: User | null } }> | null = null;

  private constructor() {}

  public static getInstance(): SupabaseAuthSingleton {
    if (!SupabaseAuthSingleton.instance) {
      SupabaseAuthSingleton.instance = new SupabaseAuthSingleton();
    }
    return SupabaseAuthSingleton.instance;
  }

  public async getUser(): Promise<User | null> {
    // Return cached user if available
    if (this.cachedUser) {
      return this.cachedUser;
    }

    // If there's already a promise in flight, return that
    if (this.userPromise) {
      const { data } = await this.userPromise;
      return data.user;
    }

    // Otherwise, make a new request
    try {
      this.userPromise = this.supabase.auth.getUser();
      const { data } = await this.userPromise;
      this.cachedUser = data.user;
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    } finally {
      // Clear the promise so future calls will make a new request if needed
      this.userPromise = null;
    }
  }

  public clearCache(): void {
    this.cachedUser = null;
    this.userPromise = null;
  }
}

// Export a function to get the singleton instance
export const getSupabaseAuth = (): SupabaseAuthSingleton => {
  return SupabaseAuthSingleton.getInstance();
};