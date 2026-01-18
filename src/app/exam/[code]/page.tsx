"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  RadioGroup,
  Radio,
  Card,
  CardBody,
  Divider,
  Spinner,
} from "@heroui/react";
import { api } from "@/lib/api-client";

// Types derived from API would be better, but explicit here for speed
type ExamData = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  questions: Array<{
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    choices: Array<{ id: string; text: string }>;
  }>;
};

// Form Schema
const attemptSchema = z.object({
  studentName: z.string().min(2, "Name is required"),
  answers: z.record(z.string(), z.string().optional()), // Record<QuestionId, ChoiceId | Text>
});

export default function ExamPage() {
  const params = useParams();
  const examCode = params.code as string;
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const {
    data: exam,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exam", examCode],
    queryFn: async () => {
      const res = await api.exams({ code: examCode }).get();
      if (res.error) throw res.error;
      return res.data as unknown as ExamData;
    },
    enabled: !!examCode,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attemptSchema),
  });

  const submitAttempt = useMutation({
    mutationFn: async (data: any) => {
      // Transform record to array
      const answersArray = Object.entries(data.answers).map(([qId, val]) => ({
        questionId: qId,
        selectedChoiceId: val as string, // Assuming simplified for MCQ for now
        // For text answer we'd need to distinguish types
      }));

      const res = await api.exams({ code: examCode }).attempt.post({
        studentName: data.studentName,
        answers: answersArray,
      });

      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data) => {
      if (data && typeof data.score === "number") {
        setSubmittedScore(data.score);
      }
    },
    onError: (err) => {
      alert("Submission failed: " + err);
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Spinner size="lg" />
      </div>
    );
  if (error || !exam)
    return (
      <div className="p-10 text-center text-red-500">
        Exam not found or error loading.
      </div>
    );

  if (submittedScore !== null) {
    return (
      <div className="container mx-auto p-10 max-w-lg text-center">
        <Card className="bg-success-50">
          <CardBody className="py-10">
            <h1 className="text-4xl font-bold text-success-700 mb-4">
              Exam Completed!
            </h1>
            <p className="text-xl">Your Score:</p>
            <p className="text-6xl font-black mt-2">{submittedScore}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <Card className="mb-8">
        <CardBody>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          {exam.description && (
            <p className="text-default-500 mt-2">{exam.description}</p>
          )}
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            <span className="bg-primary-50 px-3 py-1 rounded text-primary">
              Duration: {exam.duration} mins
            </span>
          </div>
        </CardBody>
      </Card>

      <form
        onSubmit={handleSubmit((data) => submitAttempt.mutate(data))}
        className="space-y-8"
      >
        <Card className="border-l-4 border-primary">
          <CardBody>
            <Input
              {...register("studentName")}
              label="Enter Your Full Name"
              placeholder="John Doe"
              isRequired
              isInvalid={!!errors.studentName}
              errorMessage={errors.studentName?.message as string}
            />
          </CardBody>
        </Card>

        {exam.questions.map((q, idx) => (
          <Card key={q.id} className="p-2">
            <CardBody>
              <h3 className="text-lg font-medium mb-4">
                {idx + 1}. {q.text}
              </h3>

              {q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? (
                <Controller
                  control={control}
                  name={`answers.${q.id}`}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {q.choices.map((c) => (
                        <Radio key={c.id} value={c.id}>
                          {c.text}
                        </Radio>
                      ))}
                    </RadioGroup>
                  )}
                />
              ) : (
                <Input
                  {...register(`answers.${q.id}`)}
                  placeholder="Your answer..."
                />
              )}
            </CardBody>
          </Card>
        ))}

        <Button
          type="submit"
          size="lg"
          color="primary"
          className="w-full font-bold"
          isLoading={submitAttempt.isPending}
        >
          Submit Exam
        </Button>
      </form>
    </div>
  );
}
