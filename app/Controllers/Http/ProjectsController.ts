// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";
import ExceedingLimit from "../../Exceptions/ExceedingLimitException";
import { schema } from "@ioc:Adonis/Core/Validator";

export default class ProjectsController {
  async createProjects({ request }) {
    const { projects } = request.body();
    const user_id = request.authenticatedUser.id;

    // projects object input validation schema
    const newProjectsSchema = schema.create({
      projects: schema.array().members(
        schema.object().members({
          project_name: schema.string(),
          project_description: schema.string(),
          project_url: schema.string(),
        })
      ),
    });

    await request.validate({ schema: newProjectsSchema });

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
