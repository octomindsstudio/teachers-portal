"use client";

import { useConfirm } from "@/providers/ConfirmProvider";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@/hooks/useRouter";
import { useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Textarea,
  Card,
  CardBody,
  Chip,
  Button,
  Spinner,
  addToast,
} from "@heroui/react";
import { api } from "@/lib/api-client";
import { Plus, ArrowLeft, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formSchema, FormValues } from "../../../create/schema"; // Reusing schema
import { ExamSettings } from "../../../create/_components/ExamSettings";
import { QuestionCard } from "../../../create/_components/QuestionCard";
import { useEffect } from "react";

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { confirm } = useConfirm();

  // 1. Fetch Existing Data
  const { data: exam, isLoading: isFetching } = useQuery({
    queryKey: ["exam-edit", code],
    queryFn: async () => {
      // @ts-ignore
      const res = await api.exams({ code }).details.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      shuffleQuestions: false,
      questions: [],
    },
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // Populate Form on Load
  useEffect(() => {
    if (exam) {
      // Map backend question format to Frontend FormValues
      const formattedQuestions = exam.questions.map((q: any) => {
        let type = q.type;
        const base = {
          text: q.text,
          type: q.type,
          points: q.points,
        };

        if (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT") {
          // Backend stores both as separate? Or we auto-detected?
          // Our schema has distinct types.
          // If backend returned MC, map choices
          return {
            ...base,
            choices:
              q.mcq?.choices.map((c: any) => ({
                text: c.text,
                isCorrect: c.isCorrect,
              })) || [],
          };
        } else if (type === "TRUE_FALSE") {
          return {
            ...base,
            correctAnswer: q.trueFalse?.correct,
          };
        } else if (type === "FILL_BLANK" || type === "FILL_BLANK_CLUE") {
          let text = q.text;
          const answers = q.fillBlank?.answers || [];
          let ansIndex = 0;
          // Reconstruct text: replace [] with [answer]
          text = text.replace(/\[\]/g, () => {
            const ans = answers[ansIndex++] || "";
            return `[${ans}]`;
          });

          return {
            ...base,
            text,
            answers,
            clue: q.fillBlank?.clue,
          };
        }
        return base;
      });

      reset({
        title: exam.title,
        description: exam.description || "",
        duration: exam.duration,
        passMark: exam.passMark,
        shuffleQuestions: exam.shuffleQuestions,
        categoryId: exam.categoryId ?? undefined,
        questions: formattedQuestions,
      });
    }
  }, [exam, reset]);

  const updateExam = useMutation({
    mutationFn: async (data: FormValues) => {
      // Sanitize data
      const sanitizedData = {
        ...data,
        questions: [...data.questions].reverse().map((q) => {
          if (q.type === "FILL_BLANK" || q.type === "FILL_BLANK_CLUE") {
            return {
              ...q,
              text: q.text.replace(/\[(.*?)\]/g, "[]"),
            };
          }
          return q;
        }),
      };

      const response = await api.exams({ code }).put(sanitizedData);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      // @ts-ignore
      if (data.warning) {
        addToast({
          color: "danger",
          title: "Error",
          description: "Exam updated! " + data.warning,
        });
      }
      router.push(window.location.pathname.replace("/edit", ""));
    },
    onError: (err) => {
      console.log("Failed to update exam: " + err);
      addToast({
        color: "danger",
        title: "Error",
        description: "Failed to update.",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateExam.mutate(data);
  };

  if (isFetching)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner label="Loading Exam Data..." />
      </div>
    );

  // Safety check for locked editing
  const hasAttempts = (exam?._count?.attempts || 0) > 0;

  return (
    <div className="min-h-screen bg-default-50 pb-20">
      {/* Header Reused / Adapted */}
      <div className="bg-white border-b border-default-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Edit Exam</h1>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <span className="font-mono bg-default-100 px-1 rounded">
                {code}
              </span>
              {hasAttempts && (
                <span className="flex items-center gap-1 text-warning font-medium">
                  <Lock size={12} /> Locked (Has Attempts)
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="flat" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={() => handleSubmit(onSubmit)()}
            isLoading={updateExam.isPending || isSubmitting}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
        >
          {/* Main Content */}
          <div className="space-y-6">
            {/* Exam Details Card */}
            <Card className="border border-default-200 shadow-sm">
              <CardBody className="p-6 gap-6">
                <div className="space-y-4">
                  <Input
                    {...register("title")}
                    variant="underlined"
                    placeholder="Enter a title"
                    classNames={{
                      input: "text-2xl font-bold",
                      label: "text-default-500 font-medium",
                    }}
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                  />
                  <Textarea
                    {...register("description")}
                    variant="faded"
                    label="Description"
                    placeholder="Instructions..."
                    minRows={2}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Questions
                  <Chip size="sm" variant="flat" color="secondary">
                    {fields.length}
                  </Chip>
                </h2>
                {hasAttempts && (
                  <Chip color="warning" variant="flat" size="sm">
                    Editing Questions Disabled
                  </Chip>
                )}
              </div>

              {/* Add Question Button - Disabled if attempts exist */}
              {/* Locked Warning & Reset Action */}
              {hasAttempts ? (
                <div className="p-6 rounded-2xl border border-warning-200 bg-warning-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-warning-700 flex items-center gap-2">
                      <Lock size={18} /> Questions are Locked
                    </h3>
                    <p className="text-sm text-warning-600 max-w-xl">
                      Students have already taken this exam. Changing questions
                      now would break their result reports. You can only edit
                      settings like Duration, Title, and Pass Mark.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="shrink-0 font-semibold"
                    onPress={async () => {
                      await confirm({
                        isDanger: true,
                        description:
                          "This will DELETE ALL student attempts and scores for this exam to unlock editing. This cannot be undone. Are you sure?",
                        title: "Reset Results to Unlock",
                        onConfirm: async () => {
                          try {
                            // @ts-ignore
                            await api.exams({ code }).attempts.delete();
                            // Hard Refresh to update state
                            window.location.reload();
                          } catch (e) {
                            addToast({
                              title: "Error",
                              description: "Failed to reset: " + e,
                              color: "danger",
                            });
                          }
                        },
                      });
                    }}
                  >
                    Reset Results to Unlock
                  </Button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() =>
                    prepend({
                      text: "",
                      type: "MULTIPLE_CHOICE",
                      points: 1,
                      choices: [
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                      ],
                    })
                  }
                  className="w-full py-6 border border-dashed border-default-300 rounded-2xl flex flex-col items-center justify-center text-default-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-2 group cursor-pointer bg-default-50/50 mb-4"
                >
                  <div className="p-2 rounded-full bg-default-100 group-hover:bg-primary/10 transition-colors">
                    <Plus size={20} />
                  </div>
                  <span className="font-medium text-sm">Add New Question</span>
                </motion.button>
              )}

              <AnimatePresence mode="popLayout">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* 
                         We reuse QuestionCard. 
                         If hasAttempts is true, we ideally want to DISABLE inputs.
                         But QuestionCard doesn't have 'disabled' prop. 
                         We might need to wrap it or rely on the user not being able to save (backend ignores questions)
                         Visual feedback is important though. 
                         I'll wrap it in a pointer-events-none div if locked? 
                         That prevents expanding it to see details though.
                         Maybe just opacity? 
                     */}
                    <div
                      className={
                        hasAttempts
                          ? "opacity-60 pointer-events-none relative grayscale-[0.5]"
                          : ""
                      }
                    >
                      <QuestionCard
                        index={index}
                        questionNumber={fields.length - index}
                        control={control}
                        register={register}
                        remove={remove}
                        errors={errors}
                        setValue={setValue}
                      />
                      {hasAttempts && (
                        <div
                          className="absolute inset-0 z-10 cursor-not-allowed"
                          title="Cannot edit questions after attempts started"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Settings */}
          <ExamSettings register={register} errors={errors} control={control} />
        </motion.div>
      </div>
    </div>
  );
}
