// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import prisma from "../../../prisma/prisma";
import ProjectException from "../../Exceptions/ProjectException";
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
          project_description: schema.string.optional(),
          project_url: schema.string(),
        })
      ),
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
      include: {
        projects: true,
      },
    });

    if (!userProfile) {
      const message = "User profile must be created first";
      const status = 404;
      const errorCode = "UserProfileNotFound";

      throw new ProjectException(message, status, errorCode);
    }

    await request.validate({ schema: newProjectsSchema });

    // if more than 2, do not allow
    const userProjectsCount = userProfile.projects.length;
    const freeTierLimit = 2;

    // const limitRemainder = freeTierLimit - userProjectsCount
    if (userProjectsCount >= freeTierLimit) {
      const message = "You have exceeded the number of projects allowed";
      const status = 403;
      const errorCode = "FreeTierLimit";

      throw new ProjectException(message, status, errorCode);
    }

    const data = projects.map((project) => {
      return {
        user_id,
        username: userProfile.username,
        ...project,
      };
    });

    const createdProjects = await prisma.project.createMany({
      data,
    });

    return {
      projects: createdProjects,
    };
  }

  async getOwnProjects({ request }) {
    const user_id = request.authenticatedUser.id;

    const ownProjects = await prisma.project.findMany({
      where: {
        user_id,
      },
    });

    return {
      projects: ownProjects,
    };
  }

  async updateProjectById({ request }) {
    const user_id = request.authenticatedUser.id;
    const { id, ...updateProject } = request.body().updateProject;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    });

    if (!userProfile) {
      const message = "User profile must be created first";
      const status = 404;
      const errorCode = "UserProfileNotFound";

      throw new ProjectException(message, status, errorCode);
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
        user_id,
      },
      data: updateProject,
    });

    return {
      updatedProject,
    };
  }

  async deleteProjectByIds({ request }) {
    const user_id = request.authenticatedUser.id;
    const { projectsToDelete } = request.body();

    if (!projectsToDelete.length) {
      const message = "Please select projects to delete";
      const status = 400;
      const errorCode = "ProjectSelectionError";

      throw new ProjectException(message, status, errorCode);
    }

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    });

    if (!matchedUser) {
      const message = "Invalid credentials";
      const status = 400;
      const errorCode = "InvalidCredentials";

      throw new ProjectException(message, status, errorCode);
    }

    const deletedProjects = await prisma.project.deleteMany({
      where: {
        id: {
          in: projectsToDelete,
        },
      },
    });

    if (!deletedProjects.count) {
      const message = "Items to be deleted were not found";
      const status = 404;
      const errorCode = "ItemsNotFound";

      throw new ProjectException(message, status, errorCode);
    }

    return { deletedProjects };
  }
}
