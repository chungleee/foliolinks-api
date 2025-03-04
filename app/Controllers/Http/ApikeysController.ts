import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { string } from '@ioc:Adonis/Core/Helpers';
import prisma from '../../../prisma/prisma';
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';

export default class ApikeysController {
  public async generateApiKey({ request }: HttpContextContract) {
    const user = request.authenticatedUser;
    const { domain } = request.body();

    await validator.validate({
      schema: schema.create({
        domain: schema.string([
          rules.url({
            protocols: ['https'],
          }),
          rules.normalizeUrl({
            stripWWW: true,
          }),
        ]),
      }),
      data: {
        domain: domain,
      },
    });

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
      domain,
    };

    const result = await prisma.apiKey.create({
      data: newApiKeyData,
      select: {
        id: true,
      },
    });

    return {
      apiKey: plainKey,
      apikeyId: result.id,
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
