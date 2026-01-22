"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  RadioGroup,
  Radio,
  cn,
  Progress,
  Chip,
  ScrollShadow,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import { Clock, ShieldAlert } from "lucide-react";
import { Control, Controller, UseFormHandleSubmit } from "react-hook-form";
import { AttemptSchema } from "./schema";
import { StudentTrueFalse } from "./StudentTrueFalse";
import { StudentFillBlank } from "./StudentFillBlank";
import { Keybindy } from "@keybindy/react";

interface ActiveExamViewProps {
  exam: any;
  control: Control<AttemptSchema>;
  handleSubmit: UseFormHandleSubmit<AttemptSchema>;
  onSubmit: (data: AttemptSchema) => void;
  timeLeft: number;
  strikes: number;
  maxStrikes: number;
  progress: number;
  isSubmitting: boolean;
}

export const ActiveExamView: React.FC<ActiveExamViewProps> = ({
  exam,
  control,
  handleSubmit,
  onSubmit,
  timeLeft,
  strikes,
  maxStrikes,
  progress,
  isSubmitting,
}) => {
  // Shuffle questions if enabled
  const questions = React.useMemo(() => {
    if (!exam.shuffleQuestions) return exam.questions;

    // Create a shallow copy to sort/shuffle
    const shuffled = [...exam.questions];

    // Fisher-Yates Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, [exam.questions, exam.shuffleQuestions]);

  const [activeQuestion, setActiveQuestion] = React.useState<string | null>(
    questions[0]?.id || null,
  );

  // Ref for scrolling to questions
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const scrollToQuestion = (id: string) => {
    setActiveQuestion(id);
    const element = questionRefs.current[id];
    if (element) {
      isScrollingRef.current = true;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  const handleScroll = () => {
    if (isScrollingRef.current) return;

    // Find centered element
    const container = scrollContainerRef.current;
    if (!container) return;

    const center = container.scrollTop + container.clientHeight / 2;

    let closestId = null;
    let minDistance = Infinity;

    for (const q of questions) {
      const el = questionRefs.current[q.id];
      if (el) {
        // Since elements are relative to the container for scroll calculations (offsetParent is the container if positioned),
        // but offsetTop is relative to the offsetParent.
        // The logic: Center of element relative to container top = el.offsetTop + el.clientHeight/2
        // Distance from scroll center
        const elCenter = el.offsetTop + el.clientHeight / 2;
        const distance = Math.abs(center - elCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestId = q.id;
        }
      }
    }

    if (closestId && closestId !== activeQuestion) {
      setActiveQuestion(closestId);
    }
  };

  // Helper for duration formatting
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerColor = timeLeft < 60 ? "text-danger" : "text-default-700";

  return (
    <Keybindy
      scope="exam"
      shortcuts={[
        {
          keys: ["Print Screen"],
          options: {
            preventDefault: true,
          },
          handler(event, state) {},
        },
      ]}
    >
      <motion.div
        key="exam"
        className="flex h-screen w-full bg-default-50 overflow-hidden font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      >
        {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
        <div className="hidden lg:flex flex-col w-80 bg-white border-r border-default-100 h-full shadow-2xl shadow-default-100/50 z-20">
          <div className="p-6 border-b border-default-100 bg-white/50 backdrop-blur-md">
            <h2 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Assessment
            </h2>
            <h1 className="text-xl font-black leading-tight line-clamp-2 bg-clip-text text-transparent bg-linear-to-br from-default-900 via-default-800 to-default-600">
              {exam.title}
            </h1>
          </div>

          <ScrollShadow className="flex-1 p-6">
            <div className="grid grid-cols-4 gap-3">
              {exam.questions.map((q: any, idx: number) => {
                const isActive = activeQuestion === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(q.id)}
                    className={cn(
                      "aspect-square rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-300 border relative overflow-hidden group",
                      isActive
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105"
                        : "bg-default-50 text-default-400 border-transparent hover:bg-white hover:border-default-200 hover:text-default-700 hover:shadow-md",
                    )}
                  >
                    <span className="relative z-10">{idx + 1}</span>
                    {!isActive && (
                      <div className="absolute inset-0 bg-linear-to-tr from-default-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollShadow>

          <div className="p-6 border-t border-default-100 bg-default-50/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-default-500 uppercase tracking-wider">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                size="sm"
                classNames={{
                  indicator: "bg-linear-to-r from-primary to-violet-500",
                  track: "bg-default-100/50 border border-default-100",
                }}
              />
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold shadow-xl shadow-primary/25 bg-linear-to-r from-primary to-violet-600 hover:scale-[1.02] active:scale-95 transition-transform"
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Sticky Utility Header */}
          <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-white/20 z-10 sticky top-0">
            <div className="flex items-center gap-4 lg:hidden">
              {/* Mobile Menu Trigger would go here */}
              <span className="font-bold text-default-900 truncate max-w-[200px]">
                {exam.title}
              </span>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              {/* Timer */}
              <div
                className={cn(
                  "flex items-center gap-2 font-mono text-xl font-bold bg-default-100/50 px-4 py-2 rounded-xl",
                  timerColor,
                )}
              >
                <Clock size={18} />
                {formatTime(timeLeft)}
              </div>

              {/* Strikes */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-danger-50 text-danger-600 border border-danger-100">
                <ShieldAlert size={16} />
                <span className="text-sm font-bold">
                  {strikes}/{maxStrikes} Strikes
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable Questions Area */}
          <div
            className="flex-1 overflow-y-auto scroll-smooth"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12 pb-24">
                  {questions.map((q: any, idx: number) => {
                    const number = idx + 1;
                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        ref={(el) => (questionRefs.current[q.id] = el)}
                        className="scroll-mt-32"
                      >
                        <div className="flex gap-6 group">
                          <div className="shrink-0 hidden md:flex flex-col items-center gap-2 pt-2">
                            <span
                              className={cn(
                                "flex items-center justify-center w-12 h-12 aspect-square rounded-2xl font-black text-lg transition-colors shadow-sm",
                                activeQuestion === q.id
                                  ? "bg-primary text-white shadow-primary/30"
                                  : "bg-white text-default-400 border border-default-200",
                              )}
                            >
                              {number}
                            </span>
                            {/* Decorative Line */}
                            {idx !== questions.length - 1 && (
                              <div className="w-px h-full bg-default-200/50 my-2" />
                            )}
                          </div>

                          <Card
                            isPressable={false}
                            onMouseEnter={() => {
                              if (!isScrollingRef.current)
                                setActiveQuestion(q.id);
                            }}
                            className={cn(
                              "flex-1 border-0 shadow-xl shadow-default-100/50 transition-all duration-500 overflow-visible bg-white/80 backdrop-blur-xl",
                              activeQuestion === q.id
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-default-50 scale-[1.01]"
                                : "hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.01] hover:bg-white",
                            )}
                          >
                            <CardBody className="p-6 md:p-10">
                              {/* Mobile Number & Badge */}
                              <div className="flex items-center justify-between mb-6">
                                <span className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                  {number}
                                </span>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-default-100 text-default-500 font-bold uppercase tracking-wider text-[10px]",
                                  }}
                                >
                                  {q.points} Points
                                </Chip>
                              </div>

                              <div className="space-y-6">
                                {/* Question Text */}
                                {q.type !== "FILL_BLANK" &&
                                  q.type !== "FILL_BLANK_CLUE" && (
                                    <h3 className="text-xl md:text-2xl font-bold text-default-900 leading-normal">
                                      {q.text}
                                    </h3>
                                  )}

                                {/* Question Input Area */}
                                <div className="relative">
                                  <Controller
                                    control={control}
                                    name={`answers.${q.id}`}
                                    render={({ field }) => (
                                      <div className="pt-2">
                                        {q.type === "MULTIPLE_CHOICE" &&
                                          q.mcq && (
                                            <RadioGroup
                                              value={field.value}
                                              onValueChange={(val) => {
                                                field.onChange(val);
                                                setActiveQuestion(q.id);
                                              }}
                                              classNames={{
                                                wrapper: "gap-3",
                                              }}
                                            >
                                              {q.mcq.choices.map((c: any) => (
                                                <Radio
                                                  key={c.id}
                                                  value={c.id}
                                                  classNames={{
                                                    base: cn(
                                                      "m-0 bg-default-50 border-2 border-transparent hover:border-default-200",
                                                      "group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary/5",
                                                      "w-full max-w-full cursor-pointer rounded-2xl gap-4 p-4 transition-all duration-200",
                                                    ),
                                                    control:
                                                      "bg-white border-default-300 group-data-[selected=true]:bg-primary group-data-[selected=true]:border-primary",
                                                    label:
                                                      "w-full text-default-700 font-medium text-lg",
                                                  }}
                                                >
                                                  {c.text}
                                                </Radio>
                                              ))}
                                            </RadioGroup>
                                          )}

                                        {q.type === "MULTI_SELECT" && q.mcq && (
                                          <CheckboxGroup
                                            value={field.value || []}
                                            onValueChange={(val) => {
                                              field.onChange(val);
                                              setActiveQuestion(q.id);
                                            }}
                                            classNames={{
                                              wrapper: "gap-3",
                                            }}
                                          >
                                            {q.mcq.choices.map((c: any) => (
                                              <Checkbox key={c.id} value={c.id}>
                                                {c.text}
                                              </Checkbox>
                                            ))}
                                          </CheckboxGroup>
                                        )}

                                        {q.type === "TRUE_FALSE" && (
                                          <StudentTrueFalse
                                            questionId={q.id}
                                            value={field.value}
                                            onChange={field.onChange}
                                          />
                                        )}

                                        {(q.type === "FILL_BLANK" ||
                                          q.type === "FILL_BLANK_CLUE") && (
                                          <StudentFillBlank
                                            questionId={q.id}
                                            text={q.text}
                                            clue={q.fillBlank?.clue}
                                            onChange={field.onChange}
                                          />
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile/Layout Footer Submit Button */}
                <div className="flex justify-center pb-12 lg:hidden">
                  <div className="w-full max-w-md p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-default-200 shadow-xl space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-default-500">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      color="primary"
                      size="md"
                      classNames={{
                        indicator: "bg-linear-to-r from-primary to-indigo-500",
                      }}
                    />
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full font-bold shadow-lg shadow-primary/20 bg-linear-to-r from-primary to-indigo-600"
                      isLoading={isSubmitting}
                      onPress={() => handleSubmit(onSubmit)()}
                    >
                      Submit Exam
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </Keybindy>
  );
};
