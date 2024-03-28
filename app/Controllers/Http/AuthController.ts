// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";
import { supabase } from "../../../config/supabase_config";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import prisma from "../../../prisma/prisma";

const newRegisterSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(8)]),
});

const loginSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(1)]),
});

export default class AuthController {
  async register({ request, response }) {
    const { email, password } = request.body();
    await request.validate({ schema: newRegisterSchema });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) response.send(error);

    const { session, user } = data;
    const access_token = session?.access_token;
    const refresh_token = session?.refresh_token;

    const userData = {
      id: user?.id,
      email: user?.email,
      role: user?.role,
    };

    response.cookie("foliolinks_auth_refresh_token", refresh_token);
    return { user: userData, access_token };
  }

  async login({ request, response }) {
    const { email, password } = request.body();
    await request.validate({ schema: loginSchema });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      response.send(error);
    }

    const { session, user } = data;
    const access_token = session?.access_token;
    const refresh_token = session?.refresh_token;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: user?.id,
      },
      include: {
        projects: {
          select: {
            id: true,
            username: true,
            project_name: true,
            project_description: true,
            project_url: true,
          },
        },
      },
    });

    const userData = {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      userProfile,
    };

    response.cookie("foliolinks_auth_refresh_token", refresh_token, {
      maxAge: "30d",
      secure: Env.get("NODE_ENV") === "production" ? true : false,
      sameSite: Env.get("NODE_ENV") === "production" ? "none" : "lax",
    });
    return { user: userData, access_token };
  }

  async refresh({ request, response }) {
    const refresh_token = request.cookie("foliolinks_auth_refresh_token");

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      response.send(error);
    }

    const { session } = data;

    const access_token = session?.access_token;
    const new_refresh_token = session?.refresh_token;

    response.cookie("foliolinks_auth_refresh_token", new_refresh_token, {
      maxAge: "30d",
      secure: Env.get("NODE_ENV") === "production" ? true : false,
      sameSite: Env.get("NODE_ENV") === "production" ? "none" : "lax",
    });
    return { access_token };
  }
}
