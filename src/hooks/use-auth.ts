import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "staff";

interface AuthState {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true });

  useEffect(() => {
    let mounted = true;

    const loadRole = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      return (data?.role as AppRole | undefined) ?? "staff";
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      if (!mounted) return;
      if (u) {
        const role = await loadRole(u.id);
        if (!mounted) return;
        setState({ user: u, role, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      if (!u) {
        setState({ user: null, role: null, loading: false });
        return;
      }
      // Defer role fetch to avoid deadlocks
      setTimeout(async () => {
        const role = await loadRole(u.id);
        if (!mounted) return;
        setState({ user: u, role, loading: false });
      }, 0);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
