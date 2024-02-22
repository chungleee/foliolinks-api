import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../config/supabase_config";

export default class SupabaseAuth {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const foliolinks_auth = request.cookie("foliolinks_auth");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(foliolinks_auth.access_token);

    if (error) {
      throw error;
    }

    request.authenticatedUser = user;

    await next();
  }
}
