import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { h } from 'preact';
import render from 'preact-render-to-string';
import prisma from '../../../prisma/prisma';

import Home from '../../../resources/views/Pages/Home';
import Username from '../../../resources/views/Pages/Username';

export default class UsersController {
  public async getUsername({ request, view }: HttpContextContract) {
    const { username } = request.params();

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        username,
      },
      include: {
        projects: true,
      },
    });

    if (!userProfile) {
      return view.render('app', { preact: 'Username or projects not found' });
    }

    const preact = render(
      h(Username, { userProfile, projects: userProfile.projects })
      // h(Home, { username, projects: userProfile.projects })
    );
    return view.render('app', { preact });
  }
}
