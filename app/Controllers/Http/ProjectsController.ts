import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { Project } from '@prisma/client';
import prisma from '../../../prisma/prisma';
import ProjectException from '../../Exceptions/ProjectException';
import { schema } from '@ioc:Adonis/Core/Validator';

export default class ProjectsController {
  async createProjects({ request, response }: HttpContextContract) {
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
      const message = 'User profile must be created first';
      const status = 404;
      const errorCode = 'UserProfileNotFound';

      throw new ProjectException(message, status, errorCode);
    }

    await request.validate({ schema: newProjectsSchema });

    const freeTierLimit = userProfile.membership === 'PRO' ? 3 : 1;
    const userProjectsCount = userProfile.projects.length;
    const limitReached = freeTierLimit - userProjectsCount <= 0;
    const availableSlots = freeTierLimit - userProjectsCount;

    if (limitReached) {
      const message = 'You have exceeded the number of projects allowed';
      const status = 403;
      const errorCode = 'FreeTierLimit';

      throw new ProjectException(message, status, errorCode);
    }

    if (projects.length > availableSlots) {
      const message = `You only have ${availableSlots} more project(s) allowed`;
      const status = 403;
      const errorCode = 'FreeTierLimit';

      throw new ProjectException(message, status, errorCode);
    }

    const data = projects.map((project: Project) => {
      return {
        ...project,
        user_id,
        username: userProfile.username,
      };
    });

    const createdProjects = await Promise.all(
      data.map(async (project: Project) => {
        return await prisma.project.create({
          data: project,
          select: {
            id: true,
            username: true,
            project_name: true,
            project_description: true,
            project_url: true,
          },
        });
      })
    );

    return response.ok({
      projects: createdProjects,
    });
  }

  async getOwnProjects({ request, response }: HttpContextContract) {
    const user_id = request.authenticatedUser.id;

    const ownProjects = await prisma.project.findMany({
      where: {
        user_id,
      },
      select: {
        id: true,
        project_name: true,
        project_url: true,
        project_description: true,
        username: true,
      },
    });

    return response.ok({
      projects: ownProjects,
    });
  }

  async updateProjectById({ request, response }: HttpContextContract) {
    const user_id = request.authenticatedUser.id;
    const { id, ...updateProject } = request.body().updateProject;

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    });

    if (!userProfile) {
      const message = 'User profile must be created first';
      const status = 404;
      const errorCode = 'UserProfileNotFound';

      throw new ProjectException(message, status, errorCode);
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
        user_id,
      },
      data: updateProject,
      select: {
        id: true,
        project_name: true,
        project_url: true,
        project_description: true,
        username: true,
      },
    });

    return response.ok({
      updatedProject,
    });
  }

  async deleteById({ request, response }: HttpContextContract) {
    const user_id = request.authenticatedUser.id;
    const { projectId } = request.params();
    const { project } = request.body();

    if (!project) {
      const message = 'Please select projects to delete';
      const status = 400;
      const errorCode = 'ProjectSelectionError';

      throw new ProjectException(message, status, errorCode);
    }

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    });

    if (!matchedUser) {
      const message = 'Invalid credentials';
      const status = 400;
      const errorCode = 'InvalidCredentials';

      throw new ProjectException(message, status, errorCode);
    }

    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    if (!deletedProject) {
      const message = 'Items to be deleted were not found';
      const status = 404;
      const errorCode = 'ItemsNotFound';

      throw new ProjectException(message, status, errorCode);
    }

    return response.ok({
      deleted: true,
      project: deletedProject,
    });
  }

  async deleteProjectByIds({ request, response }: HttpContextContract) {
    const user_id = request.authenticatedUser.id;
    const { projectsToDelete } = request.body();

    if (!projectsToDelete.length) {
      const message = 'Please select projects to delete';
      const status = 400;
      const errorCode = 'ProjectSelectionError';

      throw new ProjectException(message, status, errorCode);
    }

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    });

    if (!matchedUser) {
      const message = 'Invalid credentials';
      const status = 400;
      const errorCode = 'InvalidCredentials';

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
      const message = 'Items to be deleted were not found';
      const status = 404;
      const errorCode = 'ItemsNotFound';

      throw new ProjectException(message, status, errorCode);
    }

    return response.ok({ deletedProjects });
  }
}
