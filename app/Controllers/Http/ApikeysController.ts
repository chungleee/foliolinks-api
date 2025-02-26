import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { string } from '@ioc:Adonis/Core/Helpers';
import Hash from '@ioc:Adonis/Core/Hash';
import prisma from '../../../prisma/prisma';

export default class ApikeysController {
  public async generateApiKey({ request }: HttpContextContract) {
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
    const plainKey = string.generateRandom(32);
    const hashedKey = await Hash.make(plainKey);

    const newApiKeyData = {
      user_id: user.id,
      key: hashedKey,
      scope: 'readonly',
    };

    const result = await prisma.apiKey.create({
      data: newApiKeyData,
    });

    return {
      apiKey: plainKey,
      result,
    };
  }

  public async revokeApiKey({ request, response }: HttpContextContract) {
    const user = request.authenticatedUser;

    // check if api key exists
    const foundApikey = await prisma.apiKey.findUnique({
      where: {
        user_id: user?.id,
      },
    });

    if (!foundApikey) {
      return response.notFound({ error: 'API key does not exist' });
    }

    if (foundApikey.isRevoked) {
      return response.status(200).json({
        message: 'API key already revoked',
      });
    }

    await prisma.apiKey.update({
      where: {
        user_id: user?.id,
      },
      data: {
        isRevoked: true,
      },
    });

    return response.accepted({
      message: 'API key successfully revoked',
    });
  }
}
