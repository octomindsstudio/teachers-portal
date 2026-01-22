"use client";

import { Card, CardBody, Chip, Divider } from "@heroui/react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface QuestionReviewCardProps {
  index: number;
  question: any;
  answer: any;
}

export const QuestionReviewCard = ({
  index,
  question,
  answer,
}: QuestionReviewCardProps) => {
  // --- HELPERS ---

  const getStatus = () => {
    if (!answer) return "unanswered";

    let isCorrect = false;

    if (question.type === "MULTIPLE_CHOICE" && question.mcq) {
      // Find the selected choice
      const selectedId =
        answer.selectedChoiceId ||
        (answer.selectedChoiceIds && answer.selectedChoiceIds[0]);
      const choice = question.mcq.choices.find((c: any) => c.id === selectedId);
      isCorrect = choice?.isCorrect;
    } else if (question.type === "MULTI_SELECT" && question.mcq) {
      const correctIds = question.mcq.choices
        .filter((c: any) => c.isCorrect)
        .map((c: any) => c.id);
      const selectedIds = answer.selectedChoiceIds || [];
      isCorrect =
        selectedIds.length === correctIds.length &&
        selectedIds.every((id: string) => correctIds.includes(id));
    } else if (question.type === "TRUE_FALSE" && question.trueFalse) {
      isCorrect = answer.booleanAnswer === question.trueFalse.correct;
    } else if (
      (question.type === "FILL_BLANK" || question.type === "FILL_BLANK_CLUE") &&
      question.fillBlank
    ) {
      try {
        const studentAnswers = JSON.parse(
          answer.textAnswer || "[]",
        ) as string[];
        const correctAnswers = question.fillBlank.answers;
        if (
          studentAnswers.length === correctAnswers.length &&
          studentAnswers.every(
            (a, i) =>
              a.trim().toLowerCase() === correctAnswers[i].trim().toLowerCase(),
          )
        ) {
          isCorrect = true;
        }
      } catch (e) {}
    }

    return isCorrect ? "correct" : "incorrect";
  };

  const status = getStatus();

  // --- RENDERERS ---

  const renderMCQ = () => {
    if (!question.mcq) return null;
    return (
      <div className="space-y-2">
        {question.mcq.choices.map((choice: any) => {
          // Check if selected
          const isSelected =
            answer?.selectedChoiceId === choice.id ||
            answer?.selectedChoiceIds?.includes(choice.id);

          // Styles
          let styleClass =
            "p-3 rounded-xl border-2 flex justify-between items-center transition-all ";

          if (choice.isCorrect) {
            // Ideally always highlight correct answer in green?
            styleClass +=
              "border-success bg-success/5 text-success-800 font-medium";
          } else if (isSelected && !choice.isCorrect) {
            // Wrong selection
            styleClass += "border-danger bg-danger/5 text-danger-800";
          } else {
            // Neutral
            styleClass += "border-default-100 text-default-600 opacity-60";
          }

          return (
            <div key={choice.id} className={styleClass}>
              <span>{choice.text}</span>
              {isSelected && !choice.isCorrect && <XCircle size={18} />}
              {choice.isCorrect && <CheckCircle2 size={18} />}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTrueFalse = () => {
    if (!question.trueFalse) return null;
    const isTrueCorrect = question.trueFalse.correct === true;
    const studentAns = answer?.booleanAnswer;

    return (
      <div className="flex gap-4">
        {[true, false].map((val) => {
          const isCorrectOption = val === isTrueCorrect;
          const isSelected = val === studentAns;

          let color = "default";
          if (isCorrectOption) color = "success";
          else if (isSelected && !isCorrectOption) color = "danger";

          return (
            <Chip
              key={String(val)}
              variant={isSelected || isCorrectOption ? "flat" : "bordered"}
              color={color as any}
              size="lg"
              className="capitalize"
              startContent={
                isCorrectOption ? (
                  <CheckCircle2 size={14} className="ml-1" />
                ) : isSelected ? (
                  <XCircle size={14} className="ml-1" />
                ) : undefined
              }
            >
              {String(val)}
            </Chip>
          );
        })}
      </div>
    );
  };

  const renderFillBlank = () => {
    if (!question.fillBlank) return null;
    let studentAnswers: string[] = [];
    try {
      studentAnswers = JSON.parse(answer?.textAnswer || "[]");
    } catch {}

    const parts = question.text.split("[]");

    return (
      <div className="text-lg leading-loose space-x-1 font-medium">
        {parts.map((part: string, i: number) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block mx-1 relative">
                <span
                  className={`px-2 py-0.5 rounded border-b-2 
                    ${
                      studentAnswers[i]?.trim().toLowerCase() ===
                      question.fillBlank.answers[i]?.trim().toLowerCase()
                        ? "border-success text-success bg-success/5"
                        : "border-danger text-danger bg-danger/5 line-through decoration-danger"
                    }`}
                >
                  {studentAnswers[i] || "(empty)"}
                </span>
                {/* Show correct answer if wrong */}
                {studentAnswers[i]?.trim().toLowerCase() !==
                  question.fillBlank.answers[i]?.trim().toLowerCase() && (
                  <span className="absolute -top-6 left-0 text-xs text-success font-bold bg-white px-1 shadow-sm rounded border border-success/20 whitespace-nowrap">
                    {question.fillBlank.answers[i]}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card
      className={`border shadow-sm overflow-hidden transition-all group hover:shadow-md ${status === "correct" ? "border-l-4 border-l-success border-y-default-200 border-r-default-200" : "border-l-4 border-l-danger border-y-default-200 border-r-default-200"}`}
    >
      <CardBody className="p-0">
        {/* Header Section */}
        <div className="p-6 pb-4 flex gap-4">
          <div
            className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${status === "correct" ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}
          >
            Q{index + 1}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <p className="font-semibold text-lg text-default-900 leading-relaxed">
                {question.text.replace(/\[(.*?)\]/g, "___")}
              </p>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <Chip
                  size="sm"
                  variant="flat"
                  className="capitalize text-[10px] font-semibold tracking-wider h-6 bg-default-100 text-default-500"
                >
                  {question.type.replace(/_/g, " ")}
                </Chip>
                <span className="text-xs font-bold text-default-400">
                  {question.points} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="opacity-50" />

        {/* Answer Content */}
        <div className="p-6 pt-4 bg-default-50/30">
          <div className="ml-12">
            {question.type === "MULTIPLE_CHOICE" ||
            question.type === "MULTI_SELECT"
              ? renderMCQ()
              : null}
            {question.type === "TRUE_FALSE" ? renderTrueFalse() : null}
            {question.type === "FILL_BLANK" ||
            question.type === "FILL_BLANK_CLUE"
              ? renderFillBlank()
              : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
