import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Elysia, t } from "elysia";
import {
  Exam,
  FillBlankQuestion,
  MCQQuestion,
  Question,
  TrueFalseQuestion,
} from "~/generated/prisma/client";

export const examRoutes = new Elysia({ prefix: "/exams" })
  .post(
    "/",
    async ({ body, status, request }) => {
      try {
        const {
          title,
          description,
          duration,
          questions,
          shuffleQuestions,
          passMark,
          categoryId,
        } = body;
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
          return status(401, "Unauthorized");
        }

        // Generate a simple 6-character code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const exam = await prisma.exam.create({
          data: {
            title,
            description,
            duration,
            code,
            passMark,
            shuffleQuestions,
            categoryId,
            teacherId: session?.user.id,
            questions: {
              create: questions.map((q) => {
                let type = q.type;

                // Auto-detect Multi Select vs Multiple Choice based on correct answers
                if (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") {
                  const correctCount =
                    (q as any).choices?.filter((c: any) => c.isCorrect)
                      .length || 0;
                  if (correctCount > 1) {
                    type = "MULTI_SELECT";
                  } else {
                    type = "MULTIPLE_CHOICE";
                  }
                }

                const base = {
                  text: q.text,
                  type: type as any,
                  points: q.points,
                };

                if (
                  (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") &&
                  "choices" in q
                ) {
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
        passMark: t.Optional(t.Numeric()),
        shuffleQuestions: t.Optional(t.Boolean()),
        categoryId: t.Optional(t.String()),
        questions: t.Array(
          t.Union([
            // Multi Select
            t.Object({
              text: t.String(),
              type: t.Literal("MULTI_SELECT"),
              points: t.Numeric(),
              choices: t.Array(
                t.Object({
                  text: t.String(),
                  isCorrect: t.Boolean(),
                }),
              ),
            }),
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
          ]),
        ),
      }),
    },
  )
  .get("/list", async ({ request, status }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return status(401, "Unauthorized");

    const exams = await prisma.exam.findMany({
      where: {
        teacherId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        attempts: {
          select: {
            score: true,
            studentName: true,
          },
        },
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
        where: { code: code.toUpperCase() },
        include: {
          teacher: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
          questions: {
            include: {
              mcq: {
                include: {
                  choices: {
                    select: {
                      id: true,
                      text: true,
                    },
                  },
                },
              },

              fillBlank: {
                select: {
                  clue: true,
                  // Do not include answers!
                },
              },
              trueFalse: true, // Just to know it exists
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
      const { studentName, answers, strikes, durationMs } = body;

      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          questions: {
            include: {
              mcq: { include: { choices: true } },
              trueFalse: true,
              fillBlank: true,
            },
          },
        },
      });

      if (!exam) return status(404, "Exam not found");

      let score = 0;
      const attemptAnswers = [];

      // Auto-grading logic
      for (const ans of answers) {
        const question = exam.questions.find((q) => q.id === ans.questionId);
        if (!question) continue;

        let pointsAwarded = 0;
        let isCorrect = false;

        if (question.type === "MULTIPLE_CHOICE" && question.mcq) {
          const selectedChoice = question.mcq.choices.find(
            (c) => c.id === ans.selectedChoiceId,
          );
          if (selectedChoice?.isCorrect) {
            isCorrect = true;
          }
        } else if (question.type === "MULTI_SELECT" && question.mcq) {
          // Verify all selected are correct choices AND all correct choices are selected?
          // Or just standard "All selected must be correct"?
          // Strict: Sets match.
          const correctChoiceIds = question.mcq.choices
            .filter((c) => c.isCorrect)
            .map((c) => c.id);
          const selectedIds = ans.selectedChoiceIds || [];

          const isExactMatch =
            selectedIds.length === correctChoiceIds.length &&
            selectedIds.every((id) => correctChoiceIds.includes(id));

          if (isExactMatch) isCorrect = true;
        } else if (question.type === "TRUE_FALSE" && question.trueFalse) {
          if (question.trueFalse.correct === ans.booleanAnswer) {
            isCorrect = true;
          }
        } else if (
          (question.type === "FILL_BLANK" ||
            question.type === "FILL_BLANK_CLUE") &&
          question.fillBlank
        ) {
          try {
            const studentAnswers = JSON.parse(
              ans.textAnswer || "[]",
            ) as string[];
            const correctAnswers = question.fillBlank.answers;

            // Simple exact match for all blanks
            // Or partial credit? Let's do all-or-nothing for now
            if (
              studentAnswers.length === correctAnswers.length &&
              studentAnswers.every(
                (a, i) =>
                  a.trim().toLowerCase() ===
                  correctAnswers[i].trim().toLowerCase(),
              )
            ) {
              isCorrect = true;
            }
          } catch (e) {
            // parsing error
          }
        }

        if (isCorrect) pointsAwarded = question.points;

        score += pointsAwarded;
        // Consolidate choice IDs
        let finalChoiceIds: string[] = [];
        if (ans.selectedChoiceIds && ans.selectedChoiceIds.length > 0) {
          finalChoiceIds = ans.selectedChoiceIds;
        } else if (ans.selectedChoiceId) {
          finalChoiceIds = [ans.selectedChoiceId];
        }

        attemptAnswers.push({
          questionId: ans.questionId,
          selectedChoiceIds: finalChoiceIds,
          textAnswer: ans.textAnswer,
          booleanAnswer: ans.booleanAnswer,
        });
      }

      const now = new Date();
      // Calculate startedAt relative to server time to ensure duration is accurate and avoid clock drift
      // durationMs comes from client (Date.now() - savedStartTime)
      const relativeStartedAt = durationMs
        ? new Date(now.getTime() - durationMs)
        : now;

      await prisma.attempt.create({
        data: {
          studentName,
          examId: exam.id,
          score,
          strikes: strikes || 0,
          answers: {
            create: attemptAnswers,
          },
          startedAt: relativeStartedAt, // Accurate server-relative start time
          finishedAt: now,
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
        strikes: t.Optional(t.Numeric()),
        durationMs: t.Optional(t.Numeric()), // Changed from startedAt to durationMs
        answers: t.Array(
          t.Object({
            questionId: t.String(),
            selectedChoiceId: t.Optional(t.String()),
            selectedChoiceIds: t.Optional(t.Array(t.String())),
            textAnswer: t.Optional(t.String()),
            booleanAnswer: t.Optional(t.Boolean()),
          }),
        ),
      }),
    },
  )
  .get(
    "/:code/results",
    async ({ params: { code }, status, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });

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

      // Ownership Check
      if (
        exam.teacherId !== session?.user.id &&
        session?.user.role !== "admin"
      ) {
        return status(403, "Unauthorized access.");
      }

      return exam;
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    },
  )
  .get(
    "/attempt/:attemptId",
    async ({ params: { attemptId }, status, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user) return status(401, "Unauthorized");

      const attempt = await prisma.attempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: true,
          exam: {
            include: {
              questions: {
                include: {
                  mcq: { include: { choices: true } },
                  trueFalse: true,
                  fillBlank: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) return status(404, "Attempt not found");

      // Verify Ownership
      if (
        attempt.exam.teacherId !== session.user.id &&
        session.user.role !== "admin"
      ) {
        return status(403, "Unauthorized access");
      }

      return attempt;
    },
    {
      params: t.Object({
        attemptId: t.String(),
      }),
    },
  )
  .delete(
    "/:code/attempts",
    async ({ params: { code }, status, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user) return status(401, "Unauthorized");

      const exam = await prisma.exam.findUnique({
        where: { code },
      });

      if (!exam) return status(404, "Exam not found");

      if (exam.teacherId !== session.user.id && session.user.role !== "admin") {
        return status(403, "Unauthorized access");
      }

      await prisma.attempt.deleteMany({
        where: { examId: exam.id },
      });

      return { success: true };
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    },
  )
  .get(
    "/:code/details",
    async ({ params: { code }, status, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          questions: {
            orderBy: { idx: "desc" },
            include: {
              mcq: { include: { choices: true } },
              fillBlank: true,
              trueFalse: true,
            },
          },
          _count: { select: { attempts: true } },
        },
      });

      if (!exam) return status(404, "Exam not found");

      // STRICT OWNERSHIP CHECK
      if (
        exam.teacherId !== session?.user?.id &&
        session?.user?.role !== "admin"
      ) {
        return status(403, "Unauthorized");
      }

      return exam as unknown as
        | (Exam & {
            _count: { attempts: number };
            questions: (Question & {
              mcq: MCQQuestion | null;
              fillBlank: FillBlankQuestion | null;
              trueFalse: TrueFalseQuestion | null;
            })[];
          })
        | null;
    },
    {
      params: t.Object({
        code: t.String(),
      }),
    },
  )
  .put(
    "/:code",
    async ({ params: { code }, body, status, request }) => {
      const {
        title,
        description,
        duration,
        questions,
        shuffleQuestions,
        passMark,
        categoryId,
      } = body;
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session?.user) return status(401, "Unauthorized");

      const existingExam = await prisma.exam.findUnique({
        where: { code },
        include: {
          _count: { select: { attempts: true } },
        },
      });

      if (!existingExam) return status(404, "Exam not found");
      if (existingExam.teacherId !== session.user.id) {
        return status(403, "Unauthorized");
      }

      // If attempts exist, we cannot safely restructure questions (IDs would change)
      // So we restrict to Metadata update ONLY
      if (existingExam._count.attempts > 0) {
        // Basic Update
        const updated = await prisma.exam.update({
          where: { code },
          data: {
            title,
            description,
            duration,
            passMark,
            shuffleQuestions,
            categoryId,
            // Ignore questions payload
          },
        });
        return {
          success: true,
          exam: updated,
          warning:
            "Some changes were skipped because students have already taken this exam.",
        };
      }

      // Full Update (Delete old questions, create new)
      const updated = await prisma.$transaction(async (tx) => {
        // DELETE all existing questions
        await tx.question.deleteMany({
          where: { examId: existingExam.id },
        });

        // RE-CREATE exam with new questions
        return await tx.exam.update({
          where: { code },
          data: {
            title,
            description,
            duration,
            passMark,
            shuffleQuestions,
            categoryId,
            questions: {
              create: questions.map((q) => {
                let type = q.type;

                if (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") {
                  const correctCount =
                    (q as any).choices?.filter((c: any) => c.isCorrect)
                      .length || 0;
                  if (correctCount > 1) {
                    type = "MULTI_SELECT";
                  } else {
                    type = "MULTIPLE_CHOICE";
                  }
                }

                const base = {
                  text: q.text,
                  type: type as any,
                  points: q.points,
                };

                if (
                  (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") &&
                  "choices" in q
                ) {
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
                }

                return base;
              }),
            },
          },
        });
      });

      return { success: true, exam: updated };
    },
    {
      params: t.Object({
        code: t.String(),
      }),
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        duration: t.Numeric({ min: 1 }),
        passMark: t.Optional(t.Numeric()),
        shuffleQuestions: t.Optional(t.Boolean()),
        categoryId: t.Optional(t.String()),
        questions: t.Array(
          t.Union([
            // Multi Select
            t.Object({
              text: t.String(),
              type: t.Literal("MULTI_SELECT"),
              points: t.Numeric(),
              choices: t.Array(
                t.Object({
                  text: t.String(),
                  isCorrect: t.Boolean(),
                }),
              ),
            }),
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
          ]),
        ),
      }),
    },
  );
