import { createContext } from "react";
import type { Session, AuthError, User } from "@supabase/supabase-js";

export interface SessionContextType {
  session: Session | null;
  isLoggedIn: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: AuthError | null;
  }>;
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);
