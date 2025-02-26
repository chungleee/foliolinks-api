import { User } from '@supabase/supabase-js';
import { ApiKey } from '@prisma/client';

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    authenticatedUser: User;
    apikeyInfo: ApiKey;
  }
}
