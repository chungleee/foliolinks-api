// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { supabase } from "../../../config/supabase_config";

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

  async login({ request }) {
    try {
      const { email, password } = request.body();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw Error(error.message);

      return { data };
    } catch (error) {
      console.log("error: ", error);
      return { error: error.message };
    }
  }
}
