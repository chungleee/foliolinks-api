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

    if (!apikeyId || !apikey) {
      return response.unauthorized({ error: 'Invalid API credentials' });
    }

    const encryptedKey = await prisma.apiKey.findUnique({
      where: {
        id: apikeyId,
      },
    });

    if (!encryptedKey || encryptedKey.isRevoked) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    const decryptedKey = Encryption.decrypt(encryptedKey.key);
    const match = safeEqual(apikey, decryptedKey as String);

    if (!match) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    request.apikeyInfo = encryptedKey;

    await next();
  }
}
