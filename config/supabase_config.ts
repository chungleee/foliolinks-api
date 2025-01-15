import env from "#start/env";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  env.get("SUPABASE_URL"),
  env.get("SUPABASE_KEY")
);
