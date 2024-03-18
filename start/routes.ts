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

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // user profile route
  Route.group(() => {
    Route.group(() => {
      Route.post("/create", "UserProfileController.create");
      Route.delete("/:username", "UserProfileController.deleteUserProfile");
    }).middleware("supabaseAuth");

    Route.get("/:username", "UserProfileController.getUserProfile");
  }).prefix("/profile");

  // user auth routes
  Route.group(() => {
    Route.post("/register", "AuthController.register");
    Route.post("/login", "AuthController.login");
    Route.post("/refresh", "AuthController.refresh");
    Route.post("/whoisthis", "AuthController.whoisthis");
  }).prefix("/auth");

  Route.group(() => {
    Route.get("/", "ProjectsController.getOwnProjects");
    Route.post("/", "ProjectsController.createProjects");
    Route.delete("/", "ProjectsController.deleteProjectByIds");
    Route.patch("/", "ProjectsController.updateProjectById");
  })
    .middleware("supabaseAuth")
    .prefix("/projects");
}).prefix("/api/users");

Route.get("/ping", async () => {
  return { ping: "pinged" };
});

// /api/users/auth/register
// /api/users/auth/login

// /api/users/projects -> CRUD

// /api/users/profile/
