import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Elysia, t } from "elysia";

export const examRoutes = new Elysia({ prefix: "/exams" })
  .post(
    "/",
    async ({ body, status, request }) => {
      try {
        const { title, description, duration, questions, shuffleQuestions } =
          body;
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
            shuffleQuestions,
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
        shuffleQuestions: t.Optional(t.Boolean()),
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
              matching: {
                include: {
                  pairs: {
                    select: {
                      id: true,
                      leftText: true,
                      rightText: true,
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
      const { studentName, answers, strikes } = body;

      const exam = await prisma.exam.findUnique({
        where: { code },
        include: {
          questions: {
            include: {
              mcq: { include: { choices: true } },
              trueFalse: true,
              fillBlank: true,
              matching: { include: { pairs: true } },
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
        } else if (question.type === "MATCHING" && question.matching) {
          try {
            const studentMatches = ans.matchingAnswer as Record<string, string>; // { leftId: rightId }?
            // Wait, frontend sends { leftId: rightId }?
            // Let's check StudentMatching.tsx:
            // onChange(newMatches) -> key is leftId (which is pair.id), value is rightId (which is pair.rightText currently in my logic?)
            // Re-reading StudentMatching:
            // [rightItems] mapped to { id: pair.id, text: pair.rightText }
            // So rightId is actually pair.id!
            // So if studentMatches[pairId] === pairId, it's correct!

            // Let's verify grading logic
            // Iterate over all pairs
            let allCorrect = true;
            if (!studentMatches) allCorrect = false;
            else {
              for (const pair of question.matching.pairs) {
                // The user submitted match for this pair.id should be pair.id (since we used pair.id as the "value" for the right item too)
                if (studentMatches[pair.id] !== pair.id) {
                  allCorrect = false;
                  break;
                }
              }
            }
            if (allCorrect) isCorrect = true;
          } catch (e) {}
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
          matchingAnswer: ans.matchingAnswer,
        });
      }

      await prisma.attempt.create({
        data: {
          studentName,
          examId: exam.id,
          score,
          strikes: strikes || 0,
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
        strikes: t.Optional(t.Numeric()),
        answers: t.Array(
          t.Object({
            questionId: t.String(),
            selectedChoiceId: t.Optional(t.String()),
            selectedChoiceIds: t.Optional(t.Array(t.String())), // ADDED THIS
            textAnswer: t.Optional(t.String()),
            booleanAnswer: t.Optional(t.Boolean()),
            matchingAnswer: t.Optional(t.Any()), // JSON object
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
