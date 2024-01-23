-- CreateTable
CREATE TABLE "Project" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" STRING NOT NULL,
    "project_name" STRING NOT NULL,
    "project_description" STRING NOT NULL,
    "project_url" STRING NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
