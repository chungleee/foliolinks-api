import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../config/supabase_config";
import { ErrorHandler } from "../Exceptions/Handler";

export default class SupabaseAuth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
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
    } catch (error) {
      throw ErrorHandler(error, { response });
    }
  }
}
