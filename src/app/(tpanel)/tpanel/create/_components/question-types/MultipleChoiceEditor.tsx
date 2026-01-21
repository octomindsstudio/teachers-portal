"use client";

import {
  Control,
  Controller,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { Button, Input, Checkbox, cn } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { FormValues } from "../../schema";

interface MultipleChoiceEditorProps {
  index: number;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function MultipleChoiceEditor({
  index,
  register,
  control,
  setValue,
}: MultipleChoiceEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.choices` as any,
  });

  const questionType = useWatch({
    control,
    name: `questions.${index}.type` as any,
  });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {fields.map((choice, cIndex) => (
          <div
            key={choice.id}
            className="group/choice flex gap-3 items-center p-2 rounded-xl border border-default-200 bg-white hover:border-primary/50 transition-colors shadow-sm"
          >
            <Controller
              control={control}
              name={`questions.${index}.choices.${cIndex}.isCorrect` as any}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={(isSelected) => {
                    field.onChange(isSelected);

                    // Exclusive selection logic for MULTIPLE_CHOICE
                    if (isSelected && questionType === "MULTIPLE_CHOICE") {
                      fields.forEach((_, fIndex) => {
                        if (fIndex !== cIndex) {
                          setValue(
                            `questions.${index}.choices.${fIndex}.isCorrect` as any,
                            false,
                          );
                        }
                      });
                    }
                  }}
                  color={
                    questionType === "MULTIPLE_CHOICE" ? "secondary" : "success"
                  }
                  // UI Distinction: Circle for Single, Rounded Square for Multi
                  radius={questionType === "MULTIPLE_CHOICE" ? "full" : "sm"}
                  icon={
                    questionType === "MULTIPLE_CHOICE" ? (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    ) : undefined
                  }
                  classNames={{
                    wrapper: cn(
                      "before:border-default-400 group-hover/choice:before:border-primary",
                      questionType === "MULTIPLE_CHOICE"
                        ? "group-hover/choice:before:border-secondary"
                        : "group-hover/choice:before:border-success",
                    ),
                  }}
                />
              )}
            />

            <Input
              {...register(`questions.${index}.choices.${cIndex}.text` as any)}
              placeholder={`Option ${cIndex + 1}`}
              size="sm"
              variant="flat"
              classNames={{
                inputWrapper:
                  "bg-transparent! shadow-none hover:bg-transparent! px-0 group-focus-within/choice:!bg-transparent",
                input: "text-small font-medium text-default-700",
              }}
              className="flex-1"
            />

            <Button
              size="sm"
              isIconOnly
              variant="light"
              color="danger"
              className="opacity-0 group-hover/choice:opacity-100 transition-opacity"
              onPress={() => remove(cIndex)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="bordered"
        color="primary"
        className="w-full border-2 border-dashed h-10 font-medium text-primary/80 hover:text-primary hover:bg-primary/5 hover:border-primary"
        startContent={<Plus size={18} />}
        onPress={() => append({ text: "", isCorrect: false })}
      >
        Add Option
      </Button>
    </div>
  );
}
