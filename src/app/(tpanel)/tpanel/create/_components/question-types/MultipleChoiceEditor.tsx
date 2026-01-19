"use client";

import {
  Control,
  UseFormRegister,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { Button, Input, Checkbox, cn } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { FormValues } from "../../schema";

interface MultipleChoiceEditorProps {
  index: number;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
}

export function MultipleChoiceEditor({
  index,
  register,
  control,
}: MultipleChoiceEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.choices` as any,
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
                  onValueChange={field.onChange}
                  color="success"
                  size="md"
                  radius="full"
                  classNames={{
                    wrapper:
                      "before:border-default-400 group-hover/choice:before:border-success",
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
