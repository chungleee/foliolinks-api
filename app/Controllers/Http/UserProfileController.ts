// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";

const CreateUserProfileSchema = schema.create({
  username: schema.string(),
  firstName: schema.string(),
  lastName: schema.string(),
});

export default class UserProfileController {
  async create({ request }) {
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

    const data = {
      user_id: id,
      email,
      username,
      firstName,
      lastName,
    };

    const newUserProfile = await prisma.userProfile.create({
      data,
    });

    return { msg: "/users/profile/create", newUserProfile };
  }

  async getUserProfile({ request }) {
    const { username } = request.params();

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return { data: userProfile };
  }

  async deleteUserProfile({ request }) {
    const { username } = request.params();

    const auth_user_id = request.authenticatedUser.id;

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id: auth_user_id,
      },
    });

    if (!matchedUser) {
      throw "Unauthorized";
    }

    const deletedUserProfile = await prisma.userProfile.delete({
      where: {
        username,
      },
    });

    if (!deletedUserProfile) throw "ProfileDeletionError";

    return { data: deletedUserProfile };
  }
}
