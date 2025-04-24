import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import fs from 'node:fs/promises';
import prisma from '../../../prisma/prisma';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';
import { supabase } from '../../../config/supabase_config';
import { createId } from '@paralleldrive/cuid2';

const CreateUserProfileSchema = schema.create({
  firstName: schema.string(),
  lastName: schema.string(),
});

export default class UserProfileController {
  async create({ request, response }: HttpContextContract) {
    const { id, email } = request.authenticatedUser;
    const { firstName, lastName } = request.body();
    const profilePic = request.file('profilePic', {
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '2mb',
    });

    await validator.validate({
      schema: schema.create({
        id: schema.string(),
        email: schema.string([rules.email(), rules.trim()]),
      }),
      data: {
        id,
        email,
      },
    });

    await request.validate({ schema: CreateUserProfileSchema });

    let avatarPath: string | null = null;
    let oldAvatarPath: string | null = null;
    let avatarPublicUrl: string | null = null;

    if (profilePic?.isValid && profilePic.tmpPath) {
      const existingUserProfile = await prisma.userProfile.findUnique({
        where: { user_id: id },
        select: avatarPath,
      });

      oldAvatarPath = existingUserProfile?.avatar || null;

      const cuid = createId();
      const fileBuffer = await fs.readFile(profilePic.tmpPath);
      const { data, error } = await supabase.storage
        .from('foliolinks-user-avatars')
        .upload(`${email}/${cuid}.${profilePic.subtype}`, fileBuffer, {
          cacheControl: '31536000',
        });

      if (data) {
        avatarPath = data.path;

        const { data: avatarData } = supabase.storage
          .from('foliolinks-user-avatars')
          .getPublicUrl(avatarPath);

        if (avatarData) avatarPublicUrl = avatarData.publicUrl;
      }

      if (data) avatarPath = data.path;

      if (!error && oldAvatarPath) {
        await supabase.storage
          .from('foliolinks-user-avatars')
          .remove([oldAvatarPath]);
      }

      await fs.unlink(profilePic.tmpPath);
    }

    const updatedUserProfile = await prisma.userProfile.update({
      where: {
        user_id: id,
      },
      data: {
        firstName,
        lastName,
        avatar: avatarPath,
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        membership: true,
        avatar: true,
      },
    });

    return response.ok({
      data: { ...updatedUserProfile, avatar: avatarPublicUrl },
    });
  }

  async getUserProfile({ request }) {
    const { username } = request.params();

    await validator.validate({
      schema: schema.create({
        username: schema.string(),
      }),
      data: {
        username,
      },
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        membership: true,
      },
    });

    return { data: userProfile };
  }

  protected async getMyProfile({ request, response }: HttpContextContract) {
    const auth_user_id = request.authenticatedUser.id;

    await validator.validate({
      schema: schema.create({
        auth_user_id: schema.string(),
      }),
      data: {
        auth_user_id,
      },
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: auth_user_id,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        membership: true,
        avatar: true,
      },
    });

    let avatarPublicUrl: string | null = null;

    if (userProfile?.avatar) {
      const { data } = supabase.storage
        .from('foliolinks-user-avatars')
        .getPublicUrl(userProfile.avatar);

      avatarPublicUrl = data.publicUrl;
    }

    return response.ok({ data: { ...userProfile, avatar: avatarPublicUrl } });
  }

  protected async getMyJSONProfile({ request, response }: HttpContextContract) {
    const apikeyInfo = request.apikeyInfo;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id: apikeyInfo.user_id,
      },
      include: {
        projects: true,
      },
    });

    if (!userProfile) {
      return response.notFound({ error: 'Something went wrong.' });
    }

    return response.ok({ userProfile });
  }

  async deleteUserProfile({ request, response }: HttpContextContract) {
    const { username } = request.params();
    const auth_user_id = request.authenticatedUser.id;

    await validator.validate({
      schema: schema.create({
        username: schema.string(),
        auth_user_id: schema.string(),
      }),
      data: {
        username,
        auth_user_id,
      },
    });

    await prisma.userProfile.findUnique({
      where: {
        user_id: auth_user_id,
      },
    });

    const deletedUserProfile = await prisma.userProfile.delete({
      where: {
        username,
      },
    });

    return response.accepted({ data: deletedUserProfile });
  }
}
