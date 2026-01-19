"use client";

import {
  useFieldArray,
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
import { Trash2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { FormValues } from "../schema";
import { MultipleChoiceEditor } from "./question-types/MultipleChoiceEditor";
import { TrueFalseEditor } from "./question-types/TrueFalseEditor";

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
}: QuestionCardProps) {
  const {
    fields,
    append,
    remove: removeChoice,
    replace,
  } = useFieldArray({
    control,
    name: `questions.${index}.choices`,
  });

  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  return (
    <Card className="border border-default-200 shadow-sm hover:shadow-md transition-shadow duration-300 group/card overflow-visible">
      <CardBody className="p-6 gap-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-default-100 text-default-500 font-bold text-xs">
                {questionNumber}
              </span>
              <Controller
                control={control}
                name={`questions.${index}.type`}
                render={({ field }) => (
                  <Select
                    aria-label="Question Type"
                    selectedKeys={[field.value]}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newType = e.target.value;
                      field.onChange(e);

                      if (newType === "TRUE_FALSE") {
                        replace([
                          { text: "True", isCorrect: true },
                          { text: "False", isCorrect: false },
                        ]);
                      } else if (newType === "MULTIPLE_CHOICE") {
                        if (
                          questionType === "TRUE_FALSE" ||
                          fields.length === 0
                        ) {
                          replace([
                            { text: "", isCorrect: false },
                            { text: "", isCorrect: false },
                          ]);
                        }
                      }
                    }}
                    className="max-w-40"
                    size="sm"
                    variant="faded"
                    classNames={{
                      trigger: "bg-default-50 border-default-200",
                    }}
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
                  </Select>
                )}
              />
              <div className="ml-auto flex items-center gap-2">
                <Input
                  {...register(`questions.${index}.points`, {
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
              {...register(`questions.${index}.text`)}
              variant="flat"
              placeholder="Type your question here..."
              classNames={{
                input: "text-base font-medium",
                inputWrapper:
                  "bg-transparent shadow-none hover:bg-default-100 px-2 pl-0 data-[hover=true]:bg-default-50 transition-colors",
              }}
              isRequired
            />
          </div>
        </div>

        {/* Choices Area */}
        <div className="pl-10 space-y-3">
          {questionType === "TRUE_FALSE" && (
            <TrueFalseEditor
              index={index}
              fields={fields}
              register={register}
              control={control}
              setValue={setValue}
            />
          )}
          {questionType === "MULTIPLE_CHOICE" && (
            <MultipleChoiceEditor
              index={index}
              fields={fields}
              register={register}
              control={control}
              remove={removeChoice}
              append={append}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
