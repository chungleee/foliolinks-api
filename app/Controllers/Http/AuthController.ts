// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { supabase } from "../../../config/supabase_config";
import { ExceptionHandler, ErrorHandler } from "../../Exceptions/Handler";

export default class AuthController {
  async register({ request }) {
    try {
      const { email, password } = request.body();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw Error(error.message);
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  async login(ctx) {
    try {
      const { email, password } = ctx.request.body();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error)
        ErrorHandler(
          { code: "help", message: "help me pls", status: "409" },
          ctx
        );
      // throw new ExceptionHandler().handle(
      //   {
      //     code: "help",
      //     message: "help me",
      //     status: "400",
      //   },
      //   ctx
      // );
      // if (error) throw Error(error.message);

      return { data };
    } catch (error) {
      console.log("error from route: ", error);
      return { error: error.message };
    }
  }
}
