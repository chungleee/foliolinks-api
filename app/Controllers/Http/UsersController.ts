// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";
import { supabase } from "../../../config/supabase_config";

interface User {
  email: string;
  password: string;
  hashedPassword: string;
}
const users: User[] = [];

export default class UsersController {
  async index() {
    return users;
  }

  async store({ request, response }) {
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
