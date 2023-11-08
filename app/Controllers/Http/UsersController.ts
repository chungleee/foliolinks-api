// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../../config/supabase_config";

export default class UsersController {
  async index() {
    return { msg: "return users route" };
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
