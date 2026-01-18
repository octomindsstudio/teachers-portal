"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Checkbox,
  Divider,
} from "@heroui/react";
import { api } from "@/lib/api-client";

// Schema Validation
const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  points: z.number().min(1),
  choices: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean(),
    }),
  ),
});

const formSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional(),
  duration: z.number().min(1),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateExamPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const createExam = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await api.exams.post(data);
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to a success page or the exam dashboard
      if (data && data.exam) {
        alert(`Exam Created! Code: ${data.exam.code}`);
        // router.push(/exam/${data.exam.code}); // Future
      }
    },
    onError: (err) => {
      alert("Failed to create exam: " + err);
    },
  });

  const onSubmit = (data: FormValues) => {
    createExam.mutate(data);
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Exam</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Exam Details */}
        <Card>
          <CardBody className="gap-4">
            <Input
              {...register("title")}
              label="Exam Title"
              placeholder="e.g. History Midterm"
              errorMessage={errors.title?.message}
              isInvalid={!!errors.title}
            />
            <Textarea
              {...register("description")}
              label="Description"
              placeholder="Instructions for students..."
            />
            <Input
              {...register("duration", { valueAsNumber: true })}
              type="number"
              label="Duration (minutes)"
              errorMessage={errors.duration?.message}
              isInvalid={!!errors.duration}
            />
          </CardBody>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Questions</h2>

          {fields.map((field, index) => {
            return (
              <QuestionCard
                key={field.id}
                index={index}
                control={control}
                register={register}
                remove={remove}
                errors={errors}
              />
            );
          })}

          <Button
            onPress={() =>
              append({
                text: "",
                type: "MULTIPLE_CHOICE",
                points: 1,
                choices: [{ text: "", isCorrect: false }],
              })
            }
            variant="flat"
            color="primary"
            className="w-full"
          >
            + Add Question
          </Button>
        </div>

        <Divider />

        <Button
          type="submit"
          color="success"
          className="w-full font-bold text-lg"
          isLoading={createExam.isPending}
        >
          Publish Exam
        </Button>
      </form>
    </div>
  );
}

function QuestionCard({ index, control, register, remove, errors }: any) {
  const {
    fields,
    append,
    remove: removeChoice,
  } = useFieldArray({
    control,
    name: `questions.${index}.choices`,
  });

  return (
    <Card className="bg-content2">
      <CardBody className="gap-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-default-500">
            Question {index + 1}
          </h3>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={() => remove(index)}
          >
            Remove
          </Button>
        </div>

        <Input
          {...register(`questions.${index}.text`)}
          label="Question Text"
          placeholder="What is the capital of France?"
          isRequired
        />

        <div className="flex gap-4">
          <Controller
            control={control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <Select
                label="Type"
                selectedKeys={[field.value]}
                onChange={field.onChange}
                className="max-w-xs"
              >
                <SelectItem key="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem key="TRUE_FALSE">True/False</SelectItem>
                <SelectItem key="SHORT_ANSWER">Short Answer</SelectItem>
              </Select>
            )}
          />
          <Input
            {...register(`questions.${index}.points`, { valueAsNumber: true })}
            type="number"
            label="Points"
            className="max-w-[100px]"
          />
        </div>

        {/* Choices (Only for MCQ) */}
        <div className="pl-4 border-l-2 border-default-300 space-y-2">
          <label className="text-sm text-default-500 block mb-1">
            Answer Choices
          </label>
          {fields.map((choice, cIndex) => (
            <div key={choice.id} className="flex gap-2 items-center">
              <Controller
                control={control}
                name={`questions.${index}.choices.${cIndex}.isCorrect`}
                render={({ field }) => (
                  <Checkbox
                    isSelected={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Input
                {...register(`questions.${index}.choices.${cIndex}.text`)}
                placeholder={`Option ${cIndex + 1}`}
                size="sm"
              />
              <Button
                size="sm"
                isIconOnly
                variant="light"
                color="danger"
                onPress={() => removeChoice(cIndex)}
              >
                x
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="flat"
            onPress={() => append({ text: "", isCorrect: false })}
          >
            + Add Option
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
