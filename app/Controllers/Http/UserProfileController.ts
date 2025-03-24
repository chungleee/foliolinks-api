import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import prisma from '../../../prisma/prisma';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';

const CreateUserProfileSchema = schema.create({
  username: schema.string(),
  firstName: schema.string(),
  lastName: schema.string(),
});

export default class UserProfileController {
  async create({ request, response }: HttpContextContract) {
    const { id, email } = request.authenticatedUser;
    const { username, firstName, lastName } = request.body();

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

    const updatedUserProfile = await prisma.userProfile.update({
      where: {
        user_id: id,
      },
      data: {
        username,
        firstName,
        lastName,
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        membership: true,
      },
    });

    return response.ok({ data: updatedUserProfile });
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

  protected async getMyProfile({ request }) {
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
      },
    });

    return { data: userProfile };
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

    return { userProfile };
  }

  async deleteUserProfile({ request }) {
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

    return { data: deletedUserProfile };
  }
}
