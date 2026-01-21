import { z } from "zod";

export const attemptSchema = z.object({
  studentName: z.string().min(2, "Name is required"),
  answers: z.record(z.string(), z.any()),
});

export type AttemptSchema = z.infer<typeof attemptSchema>;
