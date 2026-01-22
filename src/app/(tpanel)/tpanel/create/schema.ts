import { z } from "zod";

const baseQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  points: z.number().min(1),
});

export const questionSchema = z.discriminatedUnion("type", [
  baseQuestionSchema.extend({
    type: z.literal("MULTIPLE_CHOICE"),
    choices: z.array(
      z.object({
        text: z.string(),
        isCorrect: z.boolean(),
      }),
    ),
  }),
  baseQuestionSchema.extend({
    type: z.literal("MULTI_SELECT"),
    choices: z.array(
      z.object({
        text: z.string(),
        isCorrect: z.boolean(),
      }),
    ),
  }),
  baseQuestionSchema.extend({
    type: z.literal("TRUE_FALSE"),
    correctAnswer: z.boolean(),
  }),
  baseQuestionSchema.extend({
    type: z.literal("FILL_BLANK"),
    answers: z.array(z.string()).min(1, "At least one answer required"),
  }),
  baseQuestionSchema.extend({
    type: z.literal("FILL_BLANK_CLUE"),
    answers: z.array(z.string()).min(1, "At least one answer required"),
    clue: z.string().min(1, "Clue is required"),
  }),
]);

export const formSchema = z
  .object({
    title: z.string().min(3, "Title is too short"),
    description: z.string().optional(),
    duration: z.number().min(1),
    passMark: z.number().optional(),
    categoryId: z.string().optional(),
    shuffleQuestions: z.boolean().default(false),
    questions: z.array(questionSchema).min(1, "Add at least one question"),
  })
  .superRefine((data, ctx) => {
    if (data.passMark !== undefined) {
      const totalPoints = data.questions.reduce(
        (sum, q) => sum + (q.points || 0),
        0,
      );
      if (data.passMark > totalPoints) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Pass mark cannot exceed total points (${totalPoints})`,
          path: ["passMark"],
        });
      }
    }
  });

export type FormValues = z.infer<typeof formSchema>;
