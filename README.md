# FolioLinks API server

## This is a project built with AdonisJS

Frontend repo can be found here:

https://github.com/chungleee/portfolio-links

## User Stories

### Projects API

As a **registered user**, I can:

- [x] Create a project:
  - [x] Accept array of project objects to insert to db where user_id
  - [x] Add :username as foreign key to Projects
  - [x] Return error if exceeds limit tier
  - [x] Input validation
- [x] Read list of own projects (by id)
- [x] Read user skeleton page (by username) (setup ssr with inertiajs)
- [x] Update a project
- [x] Delete a/many project(s)

### Todo List

- [] GET /:username
  - [] Write React components and build up portfolio page with appropriate data and props for SSR
- [] Deployment? Research which provider to deploy to
