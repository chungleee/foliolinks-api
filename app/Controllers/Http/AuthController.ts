import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Env from '@ioc:Adonis/Core/Env';
import { supabase } from '../../../config/supabase_config';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import prisma from '../../../prisma/prisma';
import AuthException, { AuthErrorCode } from '../../Exceptions/AuthException';

const newRegisterSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(8)]),
  username: schema.string([rules.trim(), rules.minLength(2)]),
});

const loginSchema = schema.create({
  email: schema.string([rules.email(), rules.trim()]),
  password: schema.string([rules.minLength(1)]),
});

const refreshTokenCookieName =
  Env.get('NODE_ENV') === 'production'
    ? 'foliolinks_prod_auth_refresh_token'
    : 'foliolinks_dev_auth_refresh_token';

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
      throw new AuthException(AuthErrorCode.USERNAME_TAKEN);
    }

    const { data, error: supabaseSignupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (supabaseSignupError) {
      throw new AuthException(
        supabaseSignupError.name,
        undefined,
        supabaseSignupError.message
      );
    }

    const { session, user } = data;

    if (!session || !user) {
      throw new AuthException(AuthErrorCode.SIGNUP_FAILED);
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

    response.cookie(refreshTokenCookieName, refresh_token);

    return response.ok({ user: userData, access_token });
  }

  public async login({ request, response }: HttpContextContract) {
    const { email, password } = request.body();
    await request.validate({ schema: loginSchema });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthException(error.name, undefined, error.message);
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

    response.cookie(refreshTokenCookieName, refresh_token, {
      maxAge: '30d',
      secure: Env.get('NODE_ENV') === 'production' ? true : false,
      sameSite: Env.get('NODE_ENV') === 'production' ? 'none' : 'lax',
    });

    return response.ok({ user: userData, access_token });
  }

  public async logout({ request, response }: HttpContextContract) {
    const access_token = request.access_token;
    const { error } = await supabase.auth.signOut(access_token);

    if (error) {
      return { error };
    }

    if (!error) {
      return response.clearCookie(refreshTokenCookieName).ok({
        loggedOut: true,
      });
    }
  }

  public async refresh({ request, response }) {
    const refresh_token = request.cookie(refreshTokenCookieName);

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      response.send(error);
      throw new AuthException(error.name, undefined, error.message);
    }

    const { session } = data;

    const access_token = session?.access_token;
    const new_refresh_token = session?.refresh_token;

    response.cookie(refreshTokenCookieName, new_refresh_token, {
      maxAge: '30d',
      secure: Env.get('NODE_ENV') === 'production' ? true : false,
      sameSite: Env.get('NODE_ENV') === 'production' ? 'none' : 'lax',
    });

    return response.ok({ access_token });
  }

  public async deleteAccount({ request, response }: HttpContextContract) {
    const user = request.authenticatedUser;
    const { id: userId } = user;

    const { data: userData, error: supabaseError } =
      await supabase.auth.admin.deleteUser(userId);

    if (supabaseError) {
      response.badRequest({ supabaseError });
      throw new AuthException(
        supabaseError.name,
        undefined,
        supabaseError.message
      );
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

          if (userProfile.avatar) {
            const { data: userStorageData, error: supabaseStorageError } =
              await supabase.storage
                .from('foliolinks-user-avatars')
                .remove([userProfile.avatar]);

            if (supabaseStorageError) {
              console.error(supabaseStorageError);
            }
          }
        }

        const userApiKey = await tx.apiKey.findUnique({
          where: { user_id: userId },
        });
        if (userApiKey) {
          await tx.apiKey.delete({ where: { user_id: userId } });
        }

        return [userProfile, userProjectsCount, userApiKey];
      });

    response.clearCookie('refreshTokenCookieName');

    return response.ok({
      message: 'Account successfully deleted',
    });
  }
}
