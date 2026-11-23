import { Hono } from 'hono'
import { account } from './account'
import { admin } from './admin'
import { webCors } from './cors'
import { draws } from './draws'
import { health } from './health'
import { managers } from './managers'
import { wishlist } from './wishlist'

// Supabase routes a request to the `api` function with its name still on the path.
export const app = new Hono()
  .basePath('/api')
  .use(webCors)
  .route('/health', health)
  .route('/account', account)
  .route('/draws', draws)
  .route('/wishlist', wishlist)
  .route('/managers', managers)
  .route('/admin', admin)
