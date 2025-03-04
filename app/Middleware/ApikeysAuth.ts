import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import prisma from '../../prisma/prisma';
import Encryption from '@ioc:Adonis/Core/Encryption';
import { safeEqual } from '@ioc:Adonis/Core/Helpers';

export default class ApikeysAuth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const apikeyId = request.header('x-api-key-id');
    const apikey = request.header('x-api-key');
    const apikeyDomain = request.header('origin');

    if (!apikeyId || !apikey || !apikeyDomain) {
      return response.unauthorized({ error: 'Invalid API credentials' });
    }

    const encryptedApiKey = await prisma.apiKey.findUnique({
      where: {
        id: apikeyId,
      },
    });

    if (!encryptedApiKey || encryptedApiKey.isRevoked) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    const decryptedApiKey = Encryption.decrypt(encryptedApiKey.key) as String;

    const match = safeEqual(apikey, decryptedApiKey);

    if (!match) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    request.apikeyInfo = encryptedApiKey;

    await next();
  }
}
