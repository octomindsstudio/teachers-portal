"use client";

import {
  cn,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useEffect, useState } from "react";

interface StudentFillBlankProps {
  questionId: string;
  text: string;
  clue?: string | null;
  onChange: (value: string[]) => void;
}

export function StudentFillBlank({
  questionId,
  text,
  clue,
  onChange,
}: StudentFillBlankProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  // We no longer need focus state tracking because Dropdown handles it

  // Parse clues if they exist
  const clues = clue
    ? clue
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  // Calculate parts and gap count on mount or text change
  const parts = text.split("[]");
  const gapCount = parts.length - 1;

  useEffect(() => {
    // Initialize answers array
    setAnswers(new Array(gapCount).fill(""));
  }, [gapCount]);

  const handleInputChange = (index: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = val;
    setAnswers(newAnswers);
    onChange(newAnswers);
  };

  if (gapCount === 0) {
    return <div className="text-lg">{text}</div>;
  }

  return (
    <div className="text-lg leading-loose font-serif text-default-800">
      {parts.map((part, i) => {
        // If no clues, render plain input
        // If clues exist, render Dropdown wrapped Input
        const hasClues = clues.length > 0;
        const currentAnswer = answers[i] || "";

        const InputField = (
          <input
            type="text"
            className={cn(
              "mx-1.5 w-32 border-b-2 bg-default-50 px-2 py-1 text-center text-primary font-bold focus:outline-none transition-all rounded-t-lg",
              "border-default-300 focus:border-primary focus:bg-primary/5",
            )}
            value={currentAnswer}
            onChange={(e) => handleInputChange(i, e.target.value)}
            placeholder="..."
            autoComplete="off"
            // Important: prevent Dropdown from hijacking specific keys if needed,
            // generally DropdownTrigger passes props down.
          />
        );

        return (
          <span key={i}>
            {part}
            {i < gapCount && (
              <div className="inline-block relative">
                {hasClues ? (
                  <Dropdown>
                    <DropdownTrigger>
                      {/* We wrap input in a div or pass directly. 
                          HeroUI DropdownTrigger requires a ref-forwarding compatible child.
                          HTML input is generally fine, but let's see. 
                          If input click opens menu, that's what we want. */}
                      {InputField}
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Clue Suggestions"
                      onAction={(key) => handleInputChange(i, String(key))}
                      className="max-h-60 overflow-y-auto"
                    >
                      {clues.map((c) => (
                        <DropdownItem key={c} textValue={c}>
                          {c}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  InputField
                )}
              </div>
            )}
          </span>
        );
      })}
    </div>
  );
}
