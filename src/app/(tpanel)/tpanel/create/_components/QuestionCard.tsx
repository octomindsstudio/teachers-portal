"use client";

import {
  Controller,
  useWatch,
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Tooltip,
  cn,
} from "@heroui/react";
import {
  Trash2,
  CheckCircle2,
  MoreHorizontal,
  Type,
  Hash,
  ArrowLeftRight,
  ListPlus,
} from "lucide-react";
import { FormValues } from "../schema";
import { MultipleChoiceEditor } from "./question-types/MultipleChoiceEditor";
import { TrueFalseEditor } from "./question-types/TrueFalseEditor";
import { FillBlankEditor } from "./question-types/FillBlankEditor";
import { MatchingEditor } from "./question-types/MatchingEditor";

interface QuestionCardProps {
  index: number;
  questionNumber: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
  errors: FieldErrors<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function QuestionCard({
  index,
  questionNumber,
  control,
  register,
  remove,
  setValue,
  errors,
}: QuestionCardProps) {
  const questionType = useWatch({
    control,
    name: `questions.${index}.type` as any,
  });

  const handleTypeChange = (newType: string) => {
    // Reset defaults based on type
    if (newType === "MULTIPLE_CHOICE") {
      setValue(`questions.${index}` as any, {
        type: "MULTIPLE_CHOICE",
        text: "",
        points: 1,
        choices: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });
    } else if (newType === "TRUE_FALSE") {
      setValue(`questions.${index}` as any, {
        type: "TRUE_FALSE",
        text: "",
        points: 1,
        correctAnswer: true,
      });
    } else if (newType === "FILL_BLANK") {
      setValue(`questions.${index}` as any, {
        type: "FILL_BLANK",
        text: "",
        points: 1,
        answers: [""],
      });
    } else if (newType === "FILL_BLANK_CLUE") {
      setValue(`questions.${index}` as any, {
        type: "FILL_BLANK_CLUE",
        text: "",
        points: 1,
        answers: [""],
        clue: "",
      });
    } else if (newType === "NUMERIC") {
      setValue(`questions.${index}` as any, {
        type: "NUMERIC",
        text: "",
        points: 1,
        correctValue: 0,
        tolerance: 0,
      });
    } else if (newType === "MATCHING") {
      setValue(`questions.${index}` as any, {
        type: "MATCHING",
        text: "",
        points: 1,
        pairs: [
          { left: "", right: "" },
          { left: "", right: "" },
        ],
      });
    }
  };

  const hasError = !!errors?.questions?.[index];

  return (
    <Card
      id={`question-${index}`}
      className={cn(
        "border transition-all duration-200",
        hasError
          ? "border-danger ring-1 ring-danger"
          : "border-default-200 hover:border-default-300",
        "shadow-sm hover:shadow-md transition-shadow duration-300 group/card overflow-visible",
      )}
    >
      <CardBody className="p-6 gap-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-default-100 text-default-500 font-bold text-xs">
                {questionNumber}
              </span>
              <Controller
                control={control}
                name={`questions.${index}.type` as any}
                render={({ field }) => (
                  <Select
                    aria-label="Question Type"
                    selectedKeys={field.value ? [field.value] : []}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      handleTypeChange(e.target.value);
                    }}
                    className="max-w-48"
                    size="sm"
                    variant="faded"
                    classNames={{
                      trigger: "bg-default-50 border-default-200",
                    }}
                    disallowEmptySelection
                  >
                    <SelectItem
                      key="MULTIPLE_CHOICE"
                      startContent={<MoreHorizontal size={14} />}
                    >
                      Multiple Choice
                    </SelectItem>
                    <SelectItem
                      key="TRUE_FALSE"
                      startContent={<CheckCircle2 size={14} />}
                    >
                      True/False
                    </SelectItem>
                    <SelectItem
                      key="FILL_BLANK"
                      startContent={<Type size={14} />}
                    >
                      Fill in Blank
                    </SelectItem>
                    <SelectItem
                      key="FILL_BLANK_CLUE"
                      startContent={<ListPlus size={14} />}
                    >
                      Fill in Blank (Clue)
                    </SelectItem>
                    <SelectItem
                      key="MATCHING"
                      startContent={<ArrowLeftRight size={14} />}
                    >
                      Matching
                    </SelectItem>
                  </Select>
                )}
              />
              <div className="ml-auto flex items-center gap-2">
                <Input
                  {...register(`questions.${index}.points` as any, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  size="sm"
                  label="Points"
                  labelPlacement="outside-left"
                  className="w-26 items-center"
                  classNames={{
                    label: "mr-2 text-default-400 mb-0 font-normal text-xs",
                    input: "text-right no-arrow",
                  }}
                />
                <Tooltip content="Remove Question">
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => remove(index)}
                    className="opacity-0 group-hover/card:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Input
              {...register(`questions.${index}.text` as any)}
              variant="flat"
              placeholder={
                questionType === "FILL_BLANK" ||
                questionType === "FILL_BLANK_CLUE"
                  ? "Enter the full sentence here (e.g. 'The sky is blue'). Select text to create gaps."
                  : "Type your question here..."
              }
              classNames={{
                input: "text-base font-medium",
                inputWrapper:
                  "bg-transparent! shadow-none px-2 pl-0 data-[hover=true]:bg-default-50 transition-colors",
              }}
              isRequired
              // For Fill Blank, we might hide this or sync it with the visual editor.
              // We'll keep it as the source of truth but maybe hide it if the editor handles display.
              // For now, let's keep it visible or pass it to FillBlankEditor to control?
              // Ideally FillBlankEditor manages the text input itself.
              // Let's hide it for FillBlank and let the editor handle it
              className={
                questionType === "FILL_BLANK" ||
                questionType === "FILL_BLANK_CLUE"
                  ? "hidden"
                  : ""
              }
            />
          </div>
        </div>

        {/* Choices / Config Area */}
        <div className="space-y-3">
          {questionType === "TRUE_FALSE" && (
            <TrueFalseEditor index={index} control={control} />
          )}
          {questionType === "MULTIPLE_CHOICE" && (
            <MultipleChoiceEditor
              index={index}
              register={register}
              control={control}
            />
          )}
          {(questionType === "FILL_BLANK" ||
            questionType === "FILL_BLANK_CLUE") && (
            <FillBlankEditor
              index={index}
              register={register}
              control={control}
              setValue={setValue} // Need setValue to update text/answers
              isClueType={questionType === "FILL_BLANK_CLUE"}
            />
          )}
          {questionType === "MATCHING" && (
            <MatchingEditor
              index={index}
              register={register}
              control={control}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
