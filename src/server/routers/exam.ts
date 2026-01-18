import { prisma } from "@/lib/db";
import { Elysia, t } from "elysia";

export const examRoutes = new Elysia({ prefix: "/exams" })
  .post(
    "/",
    async ({ body, status }) => {
      try {
        const { title, description, duration, questions } = body;

        // Generate a simple 6-character code
        // In real app, check for collision
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const exam = await prisma.exam.create({
          data: {
            title,
            description,
            duration,
            code,
            questions: {
              create: questions.map((q) => ({
                text: q.text,
                type: q.type,
                points: q.points,
                choices: {
                  create: q.choices.map((c) => ({
                    text: c.text,
                    isCorrect: c.isCorrect,
                  })),
                },
              })),
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
          t.Object({
            text: t.String(),
            type: t.Enum({
              MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
              TRUE_FALSE: "TRUE_FALSE",
              SHORT_ANSWER: "SHORT_ANSWER",
            }),
            points: t.Numeric({ default: 1 }),
            choices: t.Array(
              t.Object({
                text: t.String(),
                isCorrect: t.Boolean(),
              }),
            ),
          }),
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
