"use client";

import {
  Control,
  UseFormRegister,
  FieldArrayWithId,
  Controller,
} from "react-hook-form";
import { Button, Input, Checkbox, cn } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { FormValues } from "../../schema";

interface MultipleChoiceEditorProps {
  index: number;
  fields: FieldArrayWithId<FormValues, `questions.${number}.choices`, "id">[];
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  remove: (index: number) => void;
  append: (value: { text: string; isCorrect: boolean }) => void;
}

export function MultipleChoiceEditor({
  index,
  fields,
  register,
  control,
  remove,
  append,
}: MultipleChoiceEditorProps) {
  return (
    <>
      {fields.map((choice, cIndex) => (
        <div key={choice.id} className="flex gap-3 items-center group/choice">
          <Controller
            control={control}
            name={`questions.${index}.choices.${cIndex}.isCorrect`}
            render={({ field }) => (
              <Checkbox
                isSelected={field.value}
                onValueChange={field.onChange}
                color="success"
                size="sm"
                className={cn(
                  field.value ? "opacity-100" : "opacity-50 hover:opacity-100",
                )}
              />
            )}
          />
          <Input
            {...register(`questions.${index}.choices.${cIndex}.text`)}
            placeholder={`Option ${cIndex + 1}`}
            size="sm"
            variant="bordered"
            className="flex-1"
            classNames={{
              inputWrapper:
                "bg-white border-default-200 shadow-sm h-9 min-h-0 group-focus-within/choice:border-primary",
            }}
          />
          <Button
            size="sm"
            isIconOnly
            variant="light"
            className="text-default-300 hover:text-danger opacity-0 group-hover/choice:opacity-100 transition-opacity w-8 h-8 min-w-0"
            onPress={() => remove(cIndex)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}

      <Button
        size="sm"
        variant="light"
        color="primary"
        startContent={<Plus size={14} />}
        onPress={() => append({ text: "", isCorrect: false })}
        className="ml-7 h-8 text-xs font-medium"
      >
        Add Option
      </Button>
    </>
  );
}
