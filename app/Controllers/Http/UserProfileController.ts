// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";

export default class UserProfileController {
  async create({ request, response }) {
    const user = request.authenticatedUser;
    const { username, firstName, lastName } = request.body();

    const data = {
      user_id: user.id,
      username,
      firstName,
      lastName,
    };

    const newUserProfile = await prisma.userProfile.create({
      data,
    });

    return { msg: "/users/profile/create", newUserProfile };
  }
}
