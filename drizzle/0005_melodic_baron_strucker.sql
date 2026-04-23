ALTER TABLE "attendance" ADD CONSTRAINT "attendance_sessionId_studentId_unique" UNIQUE("sessionId","studentId");--> statement-breakpoint
ALTER TABLE "batch_students" ADD CONSTRAINT "batch_students_batchId_studentId_unique" UNIQUE("batchId","studentId");--> statement-breakpoint
ALTER TABLE "batch_trainers" ADD CONSTRAINT "batch_trainers_batchId_trainerId_unique" UNIQUE("batchId","trainerId");