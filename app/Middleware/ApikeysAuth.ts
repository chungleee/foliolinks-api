import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import prisma from '../../prisma/prisma';
import Hash from '@ioc:Adonis/Core/Hash';

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

    const hashedApikey = await prisma.apiKey.findUnique({
      where: {
        id: apikeyId,
      },
    });

    if (!hashedApikey || hashedApikey.isRevoked) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    const match = await Hash.verify(hashedApikey.key, apikey);

    if (!match) {
      return response.forbidden({ error: 'Invalid API credentials' });
    }

    request.apikeyInfo = hashedApikey;

    await next();
  }
}
