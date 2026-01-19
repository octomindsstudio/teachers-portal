import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
  points: z.number().min(1),
  choices: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean(),
    }),
  ),
});

export const formSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional(),
  duration: z.number().min(1),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type FormValues = z.infer<typeof formSchema>;
