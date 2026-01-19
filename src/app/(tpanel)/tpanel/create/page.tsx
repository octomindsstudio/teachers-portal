"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/hooks/useRouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea, Card, CardBody, Chip } from "@heroui/react";
import { api } from "@/lib/api-client";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formSchema, FormValues } from "./schema";
import { ExamHeader } from "./_components/ExamHeader";
import { ExamSettings } from "./_components/ExamSettings";
import { QuestionCard } from "./_components/QuestionCard";

export default function CreateExamPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      questions: [
        {
          text: "",
          type: "MULTIPLE_CHOICE",
          points: 1,
          choices: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const createExam = useMutation({
    mutationFn: async (data: FormValues) => {
      // Sanitize data before sending
      const sanitizedData = {
        ...data,
        questions: data.questions.map(q => {
          if (q.type === 'FILL_BLANK' || q.type === 'FILL_BLANK_CLUE') {
            // Remove text inside brackets for the DB payload as requested
            // [sami] -> []
            return {
              ...q,
              text: q.text.replace(/\[(.*?)\]/g, "[]")
            };
          }
          return q;
        })
      };
      
      console.log("Submitting:", sanitizedData);
      const response = await api.exams.post(sanitizedData);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.exam) {
        router.push(`/tpanel/exams`);
      }
    },
    onError: (err) => {
      console.log("Failed to create exam: " + err);
    },
  });

  const onSubmit = (data: FormValues) => {
    createExam.mutate(data);
  };

  return (
    <div className="min-h-screen bg-default-50 pb-20">
      <ExamHeader
        onBack={() => router.back()}
        onPublish={handleSubmit(onSubmit)}
        isPublishing={createExam.isPending || isSubmitting}
        questionCount={fields.length}
        duration={watch("duration")}
      />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
                      inputWrapper: "border-b-1 border-default-200",
                    }}
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                  />
                  <Textarea
                    {...register("description")}
                    variant="faded"
                    label="Description"
                    placeholder="Add instructions or context for students..."
                    minRows={2}
                    classNames={{
                      inputWrapper: "bg-default-50 hover:bg-default-100",
                    }}
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
              </div>

              {/* Add Question Button */}
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

              <AnimatePresence mode="popLayout">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Settings */}
          <ExamSettings register={register} errors={errors} />
        </motion.div>
      </div>
    </div>
  );
}
