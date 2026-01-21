"use client";

import { cn } from "@heroui/react";

interface StudentTrueFalseProps {
  questionId: string;
  value: boolean | null | undefined; // Can be null if not answered
  onChange: (val: boolean) => void;
}

export function StudentTrueFalse({
  questionId,
  value,
  onChange,
}: StudentTrueFalseProps) {
  return (
    <div className="flex p-1 bg-default-100 rounded-lg w-full max-w-50 relative mt-2">
      <div className="relative z-10 grid grid-cols-2 text-center w-full">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "text-base font-medium py-2 px-3 rounded-md transition-all duration-200",
            value === true
              ? "bg-white text-success shadow-sm font-bold"
              : "text-default-500 hover:text-default-700",
          )}
        >
          True
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "text-base font-medium py-2 px-3 rounded-md transition-all duration-200",
            value === false
              ? "bg-white text-danger shadow-sm font-bold"
              : "text-default-500 hover:text-default-700",
          )}
        >
          False
        </button>
      </div>
    </div>
  );
}
