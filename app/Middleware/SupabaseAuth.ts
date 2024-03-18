import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../config/supabase_config";

export default class SupabaseAuth {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const bearerToken = request.header("authorization");

    if (!bearerToken?.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const access_token = bearerToken?.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error) {
      throw error;
    }

    request.authenticatedUser = user;

    await next();
  }
}
