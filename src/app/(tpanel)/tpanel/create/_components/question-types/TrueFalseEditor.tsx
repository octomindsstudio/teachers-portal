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
  control: Control<FormValues>;
}

export function TrueFalseEditor({ index, control }: TrueFalseEditorProps) {
  return (
    <div className="flex gap-4 items-center">
      <span className="text-sm font-medium text-default-500 whitespace-nowrap min-w-24">
        Correct Answer:
      </span>
      <Controller
        control={control}
        name={`questions.${index}.correctAnswer` as any}
        render={({ field }) => (
          <div className="flex p-1 bg-default-100 rounded-lg w-full max-w-50 relative">
            <div className="relative z-10 grid grid-cols-2 text-center w-full">
              <button
                type="button"
                onClick={() => field.onChange(true)}
                className={cn(
                  "text-sm font-medium py-1.5 px-3 rounded-md transition-all duration-200",
                  field.value === true
                    ? "bg-white text-success shadow-sm"
                    : "text-default-500 hover:text-default-700",
                )}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => field.onChange(false)}
                className={cn(
                  "text-sm font-medium py-1.5 px-3 rounded-md transition-all duration-200",
                  field.value === false
                    ? "bg-white text-danger shadow-sm"
                    : "text-default-500 hover:text-default-700",
                )}
              >
                False
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
