import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../config/supabase_config";

export default class SupabaseAuth {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const jwt = request.headers().authorization;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(jwt);

    if (error) {
      throw error;
    }

    request.authenticatedUser = user;

    await next();
  }
}
