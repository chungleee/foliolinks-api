// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { supabase } from "../../../config/supabase_config";

export default class UsersController {
  async index() {
    return { msg: "return users route" };
  }
}
