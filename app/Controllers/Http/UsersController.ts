// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";
import { supabase } from "../../../config/supabase_config";

export default class UsersController {
  async index() {
    return { msg: "return users route" };
  }

  async store({ request }) {
    try {
      const { email, password } = request.body();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("data from supabase: ", data);
      console.log("error from supabase: ", error);

      return { data };
    } catch (error) {
      console.log(error);
    }
  }

  async login({ request }) {
    const { email, password } = request.body();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("data from supabase: ", data);
    console.log("error from supabase: ", error);

    return { data };
  }
}
