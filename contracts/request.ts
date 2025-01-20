import { User } from '@supabase/supabase-js'

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    authenticatedUser: User | null;
  }
}
