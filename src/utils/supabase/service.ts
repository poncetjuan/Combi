import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Cliente con la service_role key: solo se importa desde código de servidor
// (route handlers). Ignora RLS, así que nunca debe llegar al bundle del cliente.
export const supabaseService = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
