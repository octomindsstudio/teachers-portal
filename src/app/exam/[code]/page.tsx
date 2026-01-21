"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner, useDisclosure, Card, addToast, Button } from "@heroui/react";
import { api } from "@/lib/api-client";
import { AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { useAntiCheat } from "@/hooks/useAntiCheat";
// New Components
import { WelcomeView } from "./_components/WelcomeView";
import { ActiveExamView } from "./_components/ActiveExamView";
import { ResultView } from "./_components/ResultView";
import { WatchdogModal } from "./_components/WatchdogModal";
import { attemptSchema } from "./_components/schema";

// Types derived from API
type ExamData = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  teacher?: { name: string; image: string | null } | null;
  _count: { attempts: number };
  questions: Array<{
    id: string;
    text: string;
    type:
      | "MULTIPLE_CHOICE"
      | "MULTI_SELECT"
      | "TRUE_FALSE"
      | "FILL_BLANK"
      | "FILL_BLANK_CLUE"
      | "MATCHING";
    points: number;
    // Relationships
    mcq?: { choices: Array<{ id: string; text: string }> };
    trueFalse?: { correct: boolean };
    fillBlank?: { answers: string[]; clue?: string | null };
    matching?: {
      pairs: Array<{ id: string; leftText: string; rightText: string }>;
    };
  }>;
};

// Form Schema

type ExamStage = "welcome" | "active" | "submitted" | "booted";

export default function ExamPage() {
  const params = useParams();
  const examCode = params.code as string;
  const storageKey = `exam_progress_${examCode}`;

  const [stage, setStage] = useState<ExamStage>("welcome");
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRestored, setIsRestored] = useState(false);
  const [showResumeScreen, setShowResumeScreen] = useState(false);

  // Track if we are auto-submitting to prevent double submissions
  const isAutoSubmitting = useRef(false);

  // Anti-Cheat Hook
  const MAX_STRIKES = 3;
  const handleBoot = useCallback(() => setStage("booted"), []);

  const {
    strikes,
    violation,
    violationSeconds,
    warningModal,
    violationTimeoutRef,
    setStrikes,
  } = useAntiCheat({
    stage,
    maxStrikes: MAX_STRIKES,
    onBoot: handleBoot,
    isAutoSubmitting,
  });

  // Track if exam is fully complete to stop any further storage saves
  const isExamComplete = useRef(false);

  const {
    data: exam,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exam", examCode],
    queryFn: async () => {
      const res = await api.exams({ code: examCode }).get();
      if (res.error) throw res.error;
      const data = res.data as unknown as ExamData;
      return data;
    },
    enabled: !!examCode,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(attemptSchema),
    mode: "onChange",
    defaultValues: {
      studentName: "",
      answers: {} as Record<string, any>,
    },
  });

  // Load State from LocalStorage
  useEffect(() => {
    if (!exam) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      (async () => {
        try {
          const parsed = JSON.parse(saved);
          const now = Date.now();

          // 1. Check Strikes (Immediate Boot)
          if (parsed.strikes) {
            setStrikes(parsed.strikes);
            if (parsed.strikes >= MAX_STRIKES) {
              setStage("booted");
              setIsRestored(true);
              return;
            }
          }

          // 2. Check Expiry (Immediate Auto-Submit)
          if (parsed.targetEndTime && now > parsed.targetEndTime) {
            setStage("booted");
            setIsRestored(true);
            return;
          } else if (parsed.targetEndTime) {
            // 3. Restore Active Session
            setStage("active");
            const remaining = Math.ceil((parsed.targetEndTime - now) / 1000);
            setTimeLeft(remaining);

            if (parsed.studentName) setValue("studentName", parsed.studentName);
            if (parsed.answers) {
              Object.entries(parsed.answers).forEach(([key, val]) => {
                setValue(`answers.${key}`, val);
              });
            }
          } else if (parsed.studentName) {
            setValue("studentName", parsed.studentName);
          }
          try {
            await document.documentElement.requestFullscreen();
          } catch (err) {
            console.log("Auto-fullscreen failed, showing resume screen");
            setShowResumeScreen(true);
          }
        } catch (e) {
          console.error("Failed to restore exam progress", e);
        }
      })();
    }
    setIsRestored(true);
  }, [exam]);

  // Save State (including strikes)
  const allAnswers = useWatch({ control });
  useEffect(() => {
    // If exam is complete, DO NOT save anything.
    if (isExamComplete.current) return;

    if (stage === "active" && isRestored) {
      const saved = localStorage.getItem(storageKey);
      let currentData = saved ? JSON.parse(saved) : {};

      const newData = {
        ...currentData,
        studentName: getValues("studentName"),
        answers: getValues("answers"),
        strikes: strikes, // Save strikes so reloading doesn't reset them
      };
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }
  }, [allAnswers, stage, isRestored, strikes]);

  // Handle Terminal States Cleanup
  useEffect(() => {
    if (stage === "submitted" || stage === "booted") {
      isExamComplete.current = true;
      localStorage.removeItem(storageKey);
    }
  }, [stage]);

  // Timer Logic
  useEffect(() => {
    if (stage === "active" && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [stage, timeLeft]);

  const handleStartExam = async () => {
    if (!getValues("studentName")) return;

    if (exam) {
      // Request Fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        addToast({
          title: "Fullscreen Required",
          description: "Fullscreen is required to take this assessment.",
          color: "danger",
        });
        return;
      }

      const durationSec = exam.duration * 60;
      const targetEndTime = Date.now() + durationSec * 1000;

      const dataToSave = {
        studentName: getValues("studentName"),
        targetEndTime: targetEndTime,
        answers: {},
        strikes: 0,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));

      setTimeLeft(durationSec);
      setStage("active");
    }
  };

  const submitAttempt = useMutation({
    mutationFn: async (data: any) => {
      const answersArray = Object.entries(data.answers).map(
        ([qId, val]: [string, any]) => {
          const question = exam?.questions.find((q) => q.id === qId);
          if (!question) return { questionId: qId };

          if (question.type === "MULTIPLE_CHOICE") {
            return { questionId: qId, selectedChoiceId: val }; // Single ID
          } else if (question.type === "MULTI_SELECT") {
            return { questionId: qId, selectedChoiceIds: val }; // Array of IDs
          } else if (question.type === "TRUE_FALSE") {
            return { questionId: qId, booleanAnswer: val };
          } else if (
            question.type === "FILL_BLANK" ||
            question.type === "FILL_BLANK_CLUE"
          ) {
            return { questionId: qId, textAnswer: JSON.stringify(val) };
          } else if (question.type === "MATCHING") {
            return { questionId: qId, matchingAnswer: val };
          }
          return { questionId: qId };
        },
      );

      const res = await api.exams({ code: examCode }).attempt.post({
        studentName: data.studentName,
        answers: answersArray,
        strikes: strikes,
      });

      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data) => {
      if (data && typeof data.score === "number") {
        setSubmittedScore(data.score);
        if (stage !== "booted") setStage("submitted");
        localStorage.removeItem(storageKey);
        // Exit fullscreen on finish
        if (document.fullscreenElement)
          document.exitFullscreen().catch(() => {});
      }
    },
    onError: (err) => {
      addToast({
        title: "Submission Failed",
        description: String(err),
        color: "danger",
      });
      isAutoSubmitting.current = false;
    },
  });

  const handleAutoSubmit = () => {
    if (isAutoSubmitting.current) return;
    isAutoSubmitting.current = true;
    handleSubmit((data) => submitAttempt.mutate(data))();
  };

  // Progress Calculation
  const answeredCount = Object.values(allAnswers.answers || {}).filter(
    (val: any) => {
      if (val === null || val === undefined) return false;
      if (typeof val === "boolean") return true; // True/False
      if (typeof val === "string") return val.trim().length > 0;
      if (Array.isArray(val)) return val.some((v) => v && v.trim().length > 0); // Fill Blank
      if (typeof val === "object") return Object.keys(val).length > 0; // Matching
      return true;
    },
  ).length;

  const totalQuestions = exam?.questions.length || 0;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (isLoading || (!isRestored && exam))
    return (
      <div className="flex justify-center items-center min-h-screen bg-default-50">
        <Spinner size="lg" color="primary" label="Loading Assessment..." />
      </div>
    );

  if (error || !exam)
    return (
      <div className="flex items-center justify-center min-h-screen bg-default-50">
        <Card className="p-8 max-w-md text-center border-danger-200 bg-danger-50">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <div className="text-danger-900 font-bold mb-2 text-xl">
            Assessment Not Found
          </div>
          <p className="text-danger-600">
            Please verify the code and try again.
          </p>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] text-default-900 select-none overflow-x-hidden">
      <AnimatePresence mode="wait">
        {/* --- WELCOME STAGE --- */}
        {stage === "welcome" && (
          <WelcomeView
            exam={exam}
            register={register}
            watch={watch}
            isValid={isValid}
            onStart={handleStartExam}
          />
        )}

        {/* --- SUBMITTED / BOOTED STAGE --- */}
        {(stage === "submitted" || stage === "booted") && (
          <ResultView
            stage={stage}
            submittedScore={submittedScore}
            totalPoints={exam.questions.reduce(
              (sum: number, q: any) => sum + (q.points || 1),
              0,
            )}
            onReset={() => {
              isExamComplete.current = true;
              localStorage.removeItem(storageKey);
            }}
          />
        )}

        {/* --- ACTIVE STAGE --- */}
        {stage === "active" && (
          <ActiveExamView
            exam={exam}
            control={control}
            handleSubmit={handleSubmit}
            onSubmit={(data) => submitAttempt.mutate(data)}
            timeLeft={timeLeft}
            strikes={strikes}
            maxStrikes={MAX_STRIKES}
            progress={progress}
            isSubmitting={submitAttempt.isPending}
          />
        )}
      </AnimatePresence>

      <WatchdogModal
        isOpen={warningModal.isOpen}
        onOpenChange={(isOpen) => {
          warningModal.onOpenChange();
          // If modal is closed (acknowledged), clear the death timer
          if (!isOpen && violationTimeoutRef.current) {
            clearInterval(violationTimeoutRef.current);
            violationTimeoutRef.current = null;
          }
        }}
        violation={violation}
        strikes={strikes}
        maxStrikes={MAX_STRIKES}
        secondsLeft={violationSeconds}
      />

      {/* --- RESUME OVERLAY --- */}
      {showResumeScreen && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 text-center p-4">
          <div className="bg-default-100 p-4 rounded-full">
            <AlertCircle size={48} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Assessment Paused</h2>
            <p className="text-default-500 max-w-md">
              Your session has been restored. Please click the button below to
              continue your assessment.
            </p>
          </div>
          <Button
            size="lg"
            color="primary"
            className="font-bold px-8"
            onPress={() => {
              document.documentElement.requestFullscreen().catch(() => {});
              setShowResumeScreen(false);
            }}
          >
            Resume Assessment
          </Button>
        </div>
      )}
    </div>
  );
}
