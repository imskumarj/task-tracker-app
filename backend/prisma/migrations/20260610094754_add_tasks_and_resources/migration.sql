-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "tuid" TEXT NOT NULL,
    "iuid" TEXT NOT NULL,
    "suid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "documentUrl" TEXT,
    "submissions" JSONB NOT NULL DEFAULT '[]',
    "evaluations" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "ruid" TEXT NOT NULL,
    "iuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "documentUrl" TEXT,
    "suids" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_tuid_key" ON "Task"("tuid");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_ruid_key" ON "Resource"("ruid");
