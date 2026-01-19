import { prisma } from "@/lib/db";
import { Elysia, t } from "elysia";

export const examRoutes = new Elysia({ prefix: "/exams" })
  .post(
    "/",
    async ({ body, status }) => {
      try {
        const { title, description, duration, questions } = body;

        // Generate a simple 6-character code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const exam = await prisma.exam.create({
          data: {
            title,
            description,
            duration,
            code,
            questions: {
              create: questions.map((q) => {
                const base = {
                  text: q.text,
                  type: q.type,
                  points: q.points,
                };

                if (q.type === "MULTIPLE_CHOICE") {
                  return {
                    ...base,
                    mcq: {
                      create: {
                        choices: {
                          create: q.choices.map((c) => ({
                            text: c.text,
                            isCorrect: c.isCorrect,
                          })),
                        },
                      },
                    },
                  };
                } else if (q.type === "TRUE_FALSE") {
                  return {
                    ...base,
                    trueFalse: {
                      create: {
                        correct: q.correctAnswer,
                      },
                    },
                  };
                } else if (
                  q.type === "FILL_BLANK" ||
                  q.type === "FILL_BLANK_CLUE"
                ) {
                  return {
                    ...base,
                    fillBlank: {
                      create: {
                        answers: q.answers,
                        clue: q.type === "FILL_BLANK_CLUE" ? q.clue : undefined,
                      },
                    },
                  };
                } else if (q.type === "MATCHING") {
                  return {
                    ...base,
                    matching: {
                      create: {
                        pairs: {
                          create: q.pairs.map((p) => ({
                            leftText: p.left,
                            rightText: p.right,
                          })),
                        },
                      },
                    },
                  };
                }

                return base; // Fallback or throw error
              }),
            },
          },
          include: {
            questions: true,
          },
        });

        return { success: true, exam };
      } catch (e) {
        console.error(e);
        return status(500, "Failed to create exam");
      }
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        duration: t.Numeric({ min: 1 }),
        questions: t.Array(
          t.Union([
            // Multiple Choice
            t.Object({
              text: t.String(),
              type: t.Literal("MULTIPLE_CHOICE"),
              points: t.Numeric(),
              choices: t.Array(
                t.Object({
                  text: t.String(),
                  isCorrect: t.Boolean(),
                }),
              ),
            }),
            // True False
            t.Object({
              text: t.String(),
              type: t.Literal("TRUE_FALSE"),
              points: t.Numeric(),
              correctAnswer: t.Boolean(),
            }),
            // Fill Blank
            t.Object({
              text: t.String(),
              type: t.Literal("FILL_BLANK"),
              points: t.Numeric(),
              answers: t.Array(t.String()),
            }),
            // Fill Blank Clue
            t.Object({
              text: t.String(),
              type: t.Literal("FILL_BLANK_CLUE"),
              points: t.Numeric(),
              answers: t.Array(t.String()),
              clue: t.String(),
            }),
            // Matching
            t.Object({
              text: t.String(),
              type: t.Literal("MATCHING"),
              points: t.Numeric(),
              pairs: t.Array(
                t.Object({
                  left: t.String(),
                  right: t.String(),
                }),
              ),
            }),
          ]),
        ),
      }),
    },
  )
  .get("/list", async () => {
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    });
    return exams;
  })
  .get(
    "/:code",
    async ({ params: { code }, status }) => {
      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          questions: {
            include: {
              choices: {
                select: {
                  id: true,
                  text: true,
                  // Do not reveal 'isCorrect' to the student!
                },
              },
            },
          },
        },
      });

      if (!exam) return status(404, "Exam not found");
      return exam;
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    },
  )
  .post(
    "/:code/attempt",
    async ({ params: { code }, body, status }) => {
      const { studentName, answers } = body;

      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          questions: {
            include: { choices: true },
          },
        },
      });

      if (!exam) return status(404, "Exam not found");

      let score = 0;
      const attemptAnswers = [];

      // Simple Auto-grading logic
      for (const ans of answers) {
        const question = exam.questions.find((q) => q.id === ans.questionId);
        if (!question) continue;

        let pointsAwarded = 0;

        if (
          question.type === "MULTIPLE_CHOICE" ||
          question.type === "TRUE_FALSE"
        ) {
          const selectedChoice = question.choices.find(
            (c) => c.id === ans.selectedChoiceId,
          );
          if (selectedChoice?.isCorrect) {
            pointsAwarded = question.points;
          }
        }

        score += pointsAwarded;
        attemptAnswers.push({
          questionId: ans.questionId,
          selectedChoiceId: ans.selectedChoiceId,
          textAnswer: ans.textAnswer,
        });
      }

      await prisma.attempt.create({
        data: {
          studentName,
          examId: exam.id,
          score,
          answers: {
            create: attemptAnswers,
          },
          finishedAt: new Date(),
        },
      });

      return { success: true, score };
    },
    {
      params: t.Object({
        code: t.String(),
      }),
      body: t.Object({
        studentName: t.String(),
        answers: t.Array(
          t.Object({
            questionId: t.String(),
            selectedChoiceId: t.Optional(t.String()),
            textAnswer: t.Optional(t.String()),
          }),
        ),
      }),
    },
  )
  .get(
    "/:code/results",
    async ({ params: { code }, status }) => {
      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          attempts: {
            orderBy: { score: "desc" },
            include: {
              answers: true,
            },
          },
        },
      });

      if (!exam) return status(404, "Exam not found");
      return exam;
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    },
  );
