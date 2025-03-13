import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { string } from '@ioc:Adonis/Core/Helpers';
import prisma from '../../../prisma/prisma';
import Encryption from '@ioc:Adonis/Core/Encryption';
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator';

export default class ApikeysController {
  public async generateApiKey({ request, response }: HttpContextContract) {
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

    // create
    const plainKey = string.generateRandom(32);
    const encryptedKey = Encryption.encrypt(plainKey);

    if (found && found.isRevoked) {
      const result = await prisma.apiKey.update({
        where: {
          id: found.id,
        },
        data: {
          key: encryptedKey,
          isRevoked: false,
          domain,
        },
        select: {
          id: true,
          domain: true,
        },
      });

      return response.json({
        apiKey: plainKey,
        apikeyId: result.id,
        domain,
      });
    } else if (!found) {
      const newApiKeyData = {
        user_id: user.id,
        key: encryptedKey,
        scope: 'readonly',
        domain,
      };

      const result = await prisma.apiKey.create({
        data: newApiKeyData,
        select: {
          id: true,
          domain: true,
        },
      });

      return response.json({
        apiKey: plainKey,
        apikeyId: result.id,
        domain,
      });
    } else {
      return response.forbidden({
        message: 'Api key already exists',
      });
    }
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

  public async getApiKey({ request, response }: HttpContextContract) {
    const user = request.authenticatedUser;

    const apikey = await prisma.apiKey.findUnique({
      where: {
        user_id: user.id,
      },
      select: {
        id: true,
        key: true,
        isRevoked: true,
        domain: true,
      },
    });

    if (!apikey || apikey?.isRevoked) {
      return response.unauthorized({ error: 'Invalid API credentials' });
    }

    const decryptedApikey = Encryption.decrypt(apikey.key);

    return response.json({
      ...apikey,
      apiKey: decryptedApikey,
      apikeyId: apikey.id,
    });
  }
}
