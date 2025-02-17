// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from '@ioc:Adonis/Core/Helpers';
import Hash from '@ioc:Adonis/Core/Hash';
import prisma from '../../../prisma/prisma';

export default class ApikeysController {
  public async generateApiKey({ request }) {
    const user = request.authenticatedUser;

    // check if user already has api key
    const found = await prisma.apiKey.findUnique({
      where: {
        user_id: user.id,
      },
    });

    if (found) {
      return {
        message: 'Api key already exists',
      };
    }

    // create
    const key = string.generateRandom(32);
    const hashedKey = await Hash.make(key);

    const newApiKeyData = {
      user_id: user.id,
      key: hashedKey,
      scope: 'readonly',
    };

    const result = await prisma.apiKey.create({
      data: newApiKeyData,
    });

    return {
      hashedKey,
      user,
      result,
    };
  }

  public async revokeApiKey({ request }) {
    const user = request.authenticatedUser;

    const result = await prisma.apiKey.update({
      where: {
        user_id: user.id,
      },
      data: {
        isRevoked: true,
      },
    });

    if (result) {
      return {
        success: true,
        message: 'Api key successfully revoked.',
      };
    } else {
      return {
        success: false,
        message: 'Something went wrong.',
      };
    }
  }
}
