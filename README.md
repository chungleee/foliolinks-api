# FolioLinks API server

## User Stories

### Projects API

As a **registered user**, I can:

- [x] Create a project:
  - [x] Accept array of project objects to insert to db where user_id
  - [x] Add :username as foreign key to Projects
  - [x] Return error if exceeds limit tier
  - [x] Input validation
- [x] Read list of own projects (by id)
- [] Read user page (by username)
- [] Update a project
- [x] Delete a/many project(s)
