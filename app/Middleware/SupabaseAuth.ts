import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../config/supabase_config";
import "@ioc:Adonis/Core/Request";

declare module "@ioc:Adonis/Core/Request" {
  interface RequestContract {
    access_token?: string;
  }
}

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
    request.access_token = access_token;

    await next();
  }
}
