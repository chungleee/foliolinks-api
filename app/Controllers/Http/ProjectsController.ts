// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";

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
    if (userProjectsCount >= 2) {
      throw new Error("FreeTierLimit");
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
