// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from '@ioc:Adonis/Core/Helpers';
import Hash from '@ioc:Adonis/Core/Hash';
import prisma from '../../../prisma/prisma';

export default class ApikeysController {
  public async generateApiKey({ request }) {
    const user = request.authenticatedUser;

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
}
