CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"studentId" text NOT NULL,
	"status" "attendance_status" NOT NULL,
	"markedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batch" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"institutionId" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batch_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"batchId" text NOT NULL,
	"createdBy" text NOT NULL,
	"isActive" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "batch_students" (
	"batchId" text NOT NULL,
	"studentId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_trainers" (
	"batchId" text NOT NULL,
	"trainerId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"batchId" text NOT NULL,
	"trainerId" text NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
