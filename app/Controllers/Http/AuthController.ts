// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "../../../config/supabase_config";
import { ErrorHandler } from "../../Exceptions/Handler";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

const newRegisterSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(8)]),
});

export default class AuthController {
  async register({ request, response }) {
    try {
      const { email, password } = request.body();
      await request.validate({ schema: newRegisterSchema });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { data };
    } catch (error) {
      throw ErrorHandler(error, { response });
    }
  }

  async login(ctx) {
    try {
      const { email, password } = ctx.request.body();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) ErrorHandler({ message: error.message, status: "409" }, ctx);

      return { data };
    } catch (error) {
      console.log("error from route: ", error);
      return { error: error.message };
    }
  }
}
