import React, { useState, useEffect, FC } from "react";
import { supabase } from "../supabase/supabaseClient";
import { SessionContext, SessionContextType } from "../contexts/SessionContext";
import type { Session } from "@supabase/supabase-js";

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Get the initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoggedIn(!!session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        setIsLoggedIn(!!session);
      }
    );

    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Sign in using Supabase's signInWithPassword method
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign out using Supabase's signOut method
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Sign up using Supabase's signUp method
  const signUp = async (email: string, password: string) => {
    const response = await supabase.auth.signUp({ email, password });
    return response;
  };

  const contextValue: SessionContextType = {
    session,
    isLoggedIn,
    signIn,
    signOut,
    signUp,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
