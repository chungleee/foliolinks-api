// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";
import ExceedingLimit from "../../Exceptions/ExceedingLimitException";

export default class ProjectsController {
  async createProjects({ request }) {
    const { projects } = request.body();
    const user_id = request.authenticatedUser.id;

    // fetch number projects by user_id
    const userProjectsCount = await prisma.project.count({
      where: {
        user_id,
      },
    });
    // if more than 2, do not allow

    const freeTierLimit = 2;
    // const limitRemainder = freeTierLimit - userProjectsCount

    if (userProjectsCount >= freeTierLimit) {
      const message = "You have exceeded the number of projects allowed";
      const status = 403;
      const errorCode = "FreeTierLimit";

      // throw new Error(errorCode);
      throw new ExceedingLimit(message, status, errorCode);
    }

    const data = projects.map((project) => {
      return {
        user_id,
        ...project,
      };
    });

    const createdProjects = await prisma.project.createMany({
      data,
    });

    return { projects: createdProjects, userProjectsCount };
  }
}
