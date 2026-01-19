"use client";

import {
  Control,
  UseFormRegister,
  FieldArrayWithId,
  Controller,
  UseFormSetValue,
} from "react-hook-form";
import { Input, Checkbox, cn } from "@heroui/react";
import { FormValues } from "../../schema";

interface TrueFalseEditorProps {
  index: number;
  fields: FieldArrayWithId<FormValues, `questions.${number}.choices`, "id">[];
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function TrueFalseEditor({
  index,
  fields,
  register,
  control,
  setValue,
}: TrueFalseEditorProps) {
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
                onValueChange={(val) => {
                  if (val) {
                    const otherIndex = cIndex === 0 ? 1 : 0;
                    setValue(
                      `questions.${index}.choices.${otherIndex}.isCorrect`,
                      false,
                    );
                  }
                  field.onChange(val);
                }}
                color="success"
                size="sm"
              />
            )}
          />
          <Input
            {...register(`questions.${index}.choices.${cIndex}.text`)}
            placeholder={`Option ${cIndex + 1}`}
            size="sm"
            variant="bordered"
            className="flex-1"
            isReadOnly
            classNames={{
              inputWrapper:
                "h-9 min-h-0 bg-white border-transparent shadow-none bg-transparent pl-0",
              input: "font-semibold text-default-600",
            }}
          />
        </div>
      ))}
    </>
  );
}
