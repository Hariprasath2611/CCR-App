-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isClassCoordinator" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT NOT NULL,
    "assignedClassId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "classSection" TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    CONSTRAINT "TimetableSlot_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyllabusNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectCode" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "academicWeekNumber" INTEGER NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "targetTopicIds" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "facultyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyPlan_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicWeekNumber" INTEGER NOT NULL,
    "completedTopicIds" TEXT NOT NULL,
    "pendingTopicIds" TEXT NOT NULL,
    "reasonsForPending" TEXT,
    "extraHoursRequested" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressLog_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtraHourRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "requestedDate" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExtraHourRequest_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsolidatedReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "overallCoverage" INTEGER NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TEXT NOT NULL,
    "ccRemarks" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subjectsJson" TEXT NOT NULL,
    "hodRemarks" TEXT,
    "approvedAt" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusNode_topicId_key" ON "SyllabusNode"("topicId");
