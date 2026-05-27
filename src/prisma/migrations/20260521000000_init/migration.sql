-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestSuite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestSuite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestSuite_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TestSuite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "suiteId" TEXT,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "preconditions" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "type" TEXT NOT NULL DEFAULT 'FUNCTIONAL',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "automationStatus" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdByName" TEXT,
    "updatedByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCaseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "testData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestStep_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "environment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testRunId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_RUN',
    "assigneeName" TEXT,
    "actualResult" TEXT,
    "notes" TEXT,
    "durationSeconds" INTEGER,
    "executedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestExecution_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestExecution_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Defect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "testCaseId" TEXT,
    "executionId" TEXT,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "externalUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Defect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Defect_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Defect_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "TestExecution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestCaseTag" (
    "testCaseId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("testCaseId", "tagId"),
    CONSTRAINT "TestCaseTag_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestCaseTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_key_key" ON "Project"("key");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "TestSuite_projectId_idx" ON "TestSuite"("projectId");

-- CreateIndex
CREATE INDEX "TestSuite_parentId_idx" ON "TestSuite"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "TestSuite_projectId_name_key" ON "TestSuite"("projectId", "name");

-- CreateIndex
CREATE INDEX "TestCase_projectId_status_idx" ON "TestCase"("projectId", "status");

-- CreateIndex
CREATE INDEX "TestCase_suiteId_idx" ON "TestCase"("suiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_projectId_key_key" ON "TestCase"("projectId", "key");

-- CreateIndex
CREATE INDEX "TestStep_testCaseId_idx" ON "TestStep"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "TestStep_testCaseId_position_key" ON "TestStep"("testCaseId", "position");

-- CreateIndex
CREATE INDEX "TestRun_projectId_status_idx" ON "TestRun"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TestRun_projectId_key_key" ON "TestRun"("projectId", "key");

-- CreateIndex
CREATE INDEX "TestExecution_testRunId_status_idx" ON "TestExecution"("testRunId", "status");

-- CreateIndex
CREATE INDEX "TestExecution_testCaseId_idx" ON "TestExecution"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "TestExecution_testRunId_testCaseId_key" ON "TestExecution"("testRunId", "testCaseId");

-- CreateIndex
CREATE INDEX "Defect_projectId_status_idx" ON "Defect"("projectId", "status");

-- CreateIndex
CREATE INDEX "Defect_testCaseId_idx" ON "Defect"("testCaseId");

-- CreateIndex
CREATE INDEX "Defect_executionId_idx" ON "Defect"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "Defect_projectId_key_key" ON "Defect"("projectId", "key");

-- CreateIndex
CREATE INDEX "Tag_projectId_idx" ON "Tag"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_projectId_name_key" ON "Tag"("projectId", "name");

-- CreateIndex
CREATE INDEX "TestCaseTag_tagId_idx" ON "TestCaseTag"("tagId");
