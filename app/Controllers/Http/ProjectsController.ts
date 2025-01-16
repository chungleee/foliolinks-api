// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Project } from '@prisma/client'
import prisma from '../../../prisma/prisma'
import ProjectException from '../../Exceptions/ProjectException'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class ProjectsController {
  async createProjects ({ request }) {
    const { projects } = request.body()
    const user_id = request.authenticatedUser.id

    // projects object input validation schema
    const newProjectsSchema = schema.create({
      projects: schema.array().members(
        schema.object().members({
          project_name: schema.string(),
          project_description: schema.string.optional(),
          project_url: schema.string(),
        })
      ),
    })

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
      include: {
        projects: true,
      },
    })

    if (!userProfile) {
      const message = 'User profile must be created first'
      const status = 404
      const errorCode = 'UserProfileNotFound'

      throw new ProjectException(message, status, errorCode)
    }

    await request.validate({ schema: newProjectsSchema })

    // if more than 2, do not allow
    let freeTierLimit
    const userProjectsCount = userProfile.projects.length

    if (userProfile.membership === 'BASIC') {
      freeTierLimit = 1
    }
    if (userProfile.membership === 'PRO') {
      freeTierLimit = 3
    }

    // const limitRemainder = freeTierLimit - userProjectsCount
    if (userProjectsCount >= freeTierLimit) {
      const message = 'You have exceeded the number of projects allowed'
      const status = 403
      const errorCode = 'FreeTierLimit'

      throw new ProjectException(message, status, errorCode)
    }

    const data = projects.map((project: Project) => {
      return {
        ...project,
        user_id,
        username: userProfile.username,
      }
    })

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
        })
      })
    )

    return {
      projects: createdProjects,
    }
  }

  async getOwnProjects ({ request }) {
    const user_id = request.authenticatedUser.id

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
    })

    return {
      projects: ownProjects,
    }
  }

  async updateProjectById ({ request }) {
    const user_id = request.authenticatedUser.id
    const { id, ...updateProject } = request.body().updateProject

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    })

    if (!userProfile) {
      const message = 'User profile must be created first'
      const status = 404
      const errorCode = 'UserProfileNotFound'

      throw new ProjectException(message, status, errorCode)
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
    })

    return {
      updatedProject,
    }
  }

  async deleteById ({ request }) {
    const user_id = request.authenticatedUser.id
    const { projectId } = request.params()
    const { project } = request.body()

    if (!project) {
      const message = 'Please select projects to delete'
      const status = 400
      const errorCode = 'ProjectSelectionError'

      throw new ProjectException(message, status, errorCode)
    }

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    })

    if (!matchedUser) {
      const message = 'Invalid credentials'
      const status = 400
      const errorCode = 'InvalidCredentials'

      throw new ProjectException(message, status, errorCode)
    }

    const deletedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    })

    if (!deletedProject) {
      const message = 'Items to be deleted were not found'
      const status = 404
      const errorCode = 'ItemsNotFound'

      throw new ProjectException(message, status, errorCode)
    }

    return {
      deleted: true,
      project: deletedProject,
    }
  }

  async deleteProjectByIds ({ request }) {
    const user_id = request.authenticatedUser.id
    const { projectsToDelete } = request.body()

    if (!projectsToDelete.length) {
      const message = 'Please select projects to delete'
      const status = 400
      const errorCode = 'ProjectSelectionError'

      throw new ProjectException(message, status, errorCode)
    }

    const matchedUser = await prisma.userProfile.findUnique({
      where: {
        user_id,
      },
    })

    if (!matchedUser) {
      const message = 'Invalid credentials'
      const status = 400
      const errorCode = 'InvalidCredentials'

      throw new ProjectException(message, status, errorCode)
    }

    const deletedProjects = await prisma.project.deleteMany({
      where: {
        id: {
          in: projectsToDelete,
        },
      },
    })

    if (!deletedProjects.count) {
      const message = 'Items to be deleted were not found'
      const status = 404
      const errorCode = 'ItemsNotFound'

      throw new ProjectException(message, status, errorCode)
    }

    return { deletedProjects }
  }
}
