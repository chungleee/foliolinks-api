/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  /**
   * USER PROFILE CONTROLLER
   * ROUTE /api/users/profile/
   * PRIVATE POST /create
   * PRIVATE DELETE /:username
   * PUBLIC GET /:username
   */
  Route.group(() => {
    Route.group(() => {
      Route.post('/create', 'UserProfileController.create');
      Route.delete('/:username', 'UserProfileController.deleteUserProfile');
      Route.get('/me', 'UserProfileController.getMyProfile');
    }).middleware('supabaseAuth');

    Route.get('/', 'UserProfileController.getMyJSONProfile').middleware(
      'apikeysAuth'
    );
    // Route.get('/:username', 'UserProfileController.getUserProfile');
  }).prefix('/profile');

  // ******************************************************************
  /**
   * AUTH CONTROLLER
   * ROUTE /api/users/auth/register
   * PRIVATE POST /register
   * PRIVATE POST /login
   * PRIVATE POST /refresh
   */
  Route.group(() => {
    Route.post('/register', 'AuthController.register');
    Route.post('/login', 'AuthController.login');
    Route.post('/refresh', 'AuthController.refresh');
    Route.post('/logout', 'AuthController.logout').middleware('supabaseAuth');
  }).prefix('/auth');

  // ******************************************************************
  /**
   * PROJECTS CONTROLLER
   * ROUTE /api/users/projects
   * PRIVATE GET /
   * PRIVATE POST /
   * PRIVATE DELETE /
   * PRIVATE PATCH /
   */

  Route.group(() => {
    Route.get('/', 'ProjectsController.getOwnProjects');
    Route.post('/', 'ProjectsController.createProjects');
    Route.delete('/', 'ProjectsController.deleteProjectByIds');
    Route.delete('/:projectId', 'ProjectsController.deleteById');
    Route.patch('/', 'ProjectsController.updateProjectById');
  })
    .middleware('supabaseAuth')
    .prefix('/projects');
}).prefix('/api/users');

// ******************************************************************
/**
 * API KEY CONTROLLER
 * ROUTE /api/apikey
 * PRIVATE POST /
 */
Route.group(() => {
  Route.post('/generate-api-key', 'ApikeysController.generateApiKey');
  Route.post('/revoke-api-key', 'ApikeysController.revokeApiKey');
})
  .prefix('/api/apikey')
  .middleware(['supabaseAuth', 'apikeysAuth']);

Route.get('/:username', 'UsersController.getUsername');

Route.get('/api/ping', async () => {
  return { ping: 'pinged' };
});
