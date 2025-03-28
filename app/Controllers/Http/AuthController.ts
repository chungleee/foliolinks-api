import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Env from '@ioc:Adonis/Core/Env';
import { supabase } from '../../../config/supabase_config';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import prisma from '../../../prisma/prisma';

const newRegisterSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(8)]),
  username: schema.string([rules.trim(), rules.minLength(2)]),
});

const loginSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(1)]),
});

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const { email, password, username } = request.body();
    await request.validate({ schema: newRegisterSchema });

    const usernameExists = await prisma.userProfile.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists) {
      return response.notAcceptable({
        error: 'Username already taken',
        errorCode: 'USERNAME_TAKEN',
      });
    }

    const { data, error: supabaseSignupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (supabaseSignupError) {
      return response.badRequest({
        error: supabaseSignupError.message,
        errorCode: supabaseSignupError.name,
      });
    }

    const { session, user } = data;

    if (!session || !user) {
      return response.badRequest({
        error: 'Sign up failed',
        errorCode: 'SIGNUP_FAILED',
      });
    }
    const access_token = session?.access_token;
    const refresh_token = session?.refresh_token;

    const newUserProfile = await prisma.userProfile.create({
      data: {
        username,
        user_id: user?.id,
        email: data.user?.email,
      },
    });

    const userData = {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      username: newUserProfile.username,
    };

    response.cookie('foliolinks_auth_refresh_token', refresh_token);
    return { user: userData, access_token };
  }

  public async login({ request, response }) {
    const { email, password } = request.body();
    await request.validate({ schema: loginSchema });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return response.send(error);
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

    response.cookie('foliolinks_auth_refresh_token', refresh_token, {
      maxAge: '30d',
      secure: Env.get('NODE_ENV') === 'production' ? true : false,
      sameSite: Env.get('NODE_ENV') === 'production' ? 'none' : 'lax',
    });
    return { user: userData, access_token };
  }

  public async logout({ request }) {
    const access_token = request.access_token;
    const { error } = await supabase.auth.signOut(access_token);

    if (error) {
      return { error };
    }

    if (!error) {
      return { loggedOut: true };
    }
  }

  public async refresh({ request, response }) {
    const refresh_token = request.cookie('foliolinks_auth_refresh_token');

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      response.send(error);
    }

    const { session } = data;

    const access_token = session?.access_token;
    const new_refresh_token = session?.refresh_token;

    response.cookie('foliolinks_auth_refresh_token', new_refresh_token, {
      maxAge: '30d',
      secure: Env.get('NODE_ENV') === 'production' ? true : false,
      sameSite: Env.get('NODE_ENV') === 'production' ? 'none' : 'lax',
    });
    return { access_token };
  }

  public async deleteAccount({ request, response }: HttpContextContract) {
    const user = request.authenticatedUser;
    const { id: userId } = user;

    const { data: userData, error: supabaseError } =
      await supabase.auth.admin.deleteUser(userId);

    if (supabaseError) {
      return response.badRequest({ supabaseError });
    }

    if (Object.keys(userData.user).length) {
      return response.badGateway({
        error: 'Account deletion went wrong',
        user: userData.user.id,
      });
    }

    const [userProfile, userProjectsCount, userApiKey] =
      await prisma.$transaction(async (tx) => {
        const userProjectsCount = await tx.project.deleteMany({
          where: { user_id: userId },
        });

        const userProfile = await tx.userProfile.findUnique({
          where: { user_id: userId },
        });

        if (userProfile) {
          await tx.userProfile.delete({ where: { user_id: userId } });
        }

        const userApiKey = await tx.apiKey.findUnique({
          where: { user_id: userId },
        });
        if (userApiKey) {
          await tx.apiKey.delete({ where: { user_id: userId } });
        }

        return [userProfile, userProjectsCount, userApiKey];
      });

    response.clearCookie('foliolinks_auth_refresh_token');

    return response.ok({
      message: 'Account successfully deleted',
    });
  }
}
