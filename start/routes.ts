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

import router from "@adonisjs/core/services/router";

router.group(() => {
  /**
   * USER PROFILE CONTROLLER
   * ROUTE /api/users/profile/
   * PRIVATE POST /create
   * PRIVATE DELETE /:username
   * PUBLIC GET /:username
   */
  router.group(() => {
    router.group(() => {
      router.post("/create", "UserProfileController.create");
      router.delete("/:username", "UserProfileController.deleteUserProfile");
      router.get("/me", "UserProfileController.getMyProfile");
    }).middleware("supabaseAuth");

    router.get("/:username", "UserProfileController.getUserProfile");
  }).prefix("/profile");

  // ******************************************************************
  /**
   * AUTH CONTROLLER
   * ROUTE /api/users/auth/register
   * PRIVATE POST /register
   * PRIVATE POST /login
   * PRIVATE POST /refresh
   */
  router.group(() => {
    router.post("/register", "AuthController.register");
    router.post("/login", "AuthController.login");
    router.post("/refresh", "AuthController.refresh");
    router.post("/logout", "AuthController.logout").middleware("supabaseAuth");
  }).prefix("/auth");

  // ******************************************************************
  /**
   * PROJECTS CONTROLLER
   * ROUTE /api/users/projects
   * PRIVATE GET /
   * PRIVATE POST /
   * PRIVATE DELETE /
   * PRIVATE PATCH /
   */

  router.group(() => {
    router.get("/", "ProjectsController.getOwnProjects");
    router.post("/", "ProjectsController.createProjects");
    router.delete("/", "ProjectsController.deleteProjectByIds");
    router.delete("/:projectId", "ProjectsController.deleteById");
    router.patch("/", "ProjectsController.updateProjectById");
  })
    .middleware("supabaseAuth")
    .prefix("/projects");
}).prefix("/api/users");

router.get("/ping", async () => {
  return { ping: "pinged" };
});
