// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
