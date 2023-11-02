import Env from "@ioc:Adonis/Core/Env";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  Env.get("SUPABASE_URL"),
  Env.get("SUPABASE_KEY")
);
