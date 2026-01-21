"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, cn, CircularProgress, Chip } from "@heroui/react";
import {
  ShieldAlert,
  Trophy,
  XCircle,
  Home,
  RotateCcw,
  PartyPopper,
  Star,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ResultViewProps {
  stage: "submitted" | "booted";
  submittedScore: number | null;
  totalPoints: number;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  stage,
  submittedScore,
  totalPoints,
  onReset,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const percentage =
    submittedScore !== null
      ? Math.round((submittedScore / totalPoints) * 100)
      : 0;

  const getGrade = (pct: number) => {
    if (pct >= 90)
      return {
        label: "S",
        color: "text-yellow-400",
        glow: "shadow-yellow-500/50",
      };
    if (pct >= 80)
      return {
        label: "A",
        color: "text-emerald-400",
        glow: "shadow-emerald-500/50",
      };
    if (pct >= 70)
      return { label: "B", color: "text-blue-400", glow: "shadow-blue-500/50" };
    if (pct >= 60)
      return {
        label: "C",
        color: "text-orange-400",
        glow: "shadow-orange-500/50",
      };
    return { label: "F", color: "text-rose-500", glow: "shadow-rose-500/50" };
  };

  const grade = getGrade(percentage);
  const isPassed = percentage >= 60; // Assuming 60 is pass for grade C
  const isBooted = stage === "booted";

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  useEffect(() => {
    if (stage === "submitted" && isPassed) {
      triggerConfetti();
    }
  }, [stage, isPassed]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black font-sans selection:bg-purple-500/30">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[100px] animate-bounce duration-[10s]" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Main Glass Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
          {/* Top Decorative Line */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-1 bg-linear-to-r",
              isBooted
                ? "from-red-500 via-orange-500 to-red-500"
                : "from-emerald-400 via-blue-500 to-purple-600",
            )}
          />

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Left Column: Hero Score */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
              {/* Grade Badge Behind */}
              {!isBooted && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -12 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className={cn(
                    "absolute -left-4 -top-4 text-9xl font-black opacity-10 select-none",
                    grade.color,
                  )}
                >
                  {grade.label}
                </motion.div>
              )}

              <div className="relative group/score cursor-default">
                {/* Glowing backing */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-2xl opacity-20 transition-opacity group-hover/score:opacity-40",
                    isBooted ? "bg-red-500" : "bg-blue-500",
                  )}
                />

                <CircularProgress
                  classNames={{
                    svg: "w-64 h-64 drop-shadow-2xl",
                    indicator: isBooted
                      ? "stroke-red-500"
                      : "stroke-url(#gradient)",
                    track: "stroke-white/10",
                    value: "text-6xl font-black text-white",
                  }}
                  value={isBooted ? 0 : percentage}
                  strokeWidth={6}
                  showValueLabel={false}
                  aria-label="Score"
                />

                {/* Custom Label Inside */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  {isBooted ? (
                    <ShieldAlert size={64} className="text-red-500 mb-2" />
                  ) : (
                    <>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className={cn(
                          "text-7xl font-black tracking-tighter drop-shadow-lg",
                          grade.color,
                        )}
                      >
                        {grade.label}
                      </motion.span>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mt-2">
                        Grade
                      </span>
                    </>
                  )}
                </div>

                {/* SVG Definitions for Gradient Stroke */}
                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Status Text Under Score */}
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isBooted
                    ? "Terminated"
                    : isPassed
                      ? "Excellent Work!"
                      : "Needs Improvement"}
                </h2>
                <p className="text-white/40 text-sm font-medium">
                  {isBooted
                    ? "Security Policy Violation"
                    : "You have completed the assessment"}
                </p>
              </div>
            </div>

            {/* Right Column: Bento Grid Stats & Actions */}
            <div className="flex-1 w-full flex flex-col gap-4">
              {/* Stat Card 1: Score % */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group/stat">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover/stat:scale-110 transition-transform">
                      <Trophy size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase text-white/40 tracking-wider">
                      Score
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {submittedScore || 0}{" "}
                    <span className="text-lg text-white/30 font-medium">
                      / {totalPoints}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group/stat">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg bg-opacity-20 transition-transform group-hover/stat:scale-110",
                        isPassed
                          ? "bg-emerald-500 text-emerald-400"
                          : "bg-orange-500/50 text-orange-400",
                      )}
                    >
                      {isPassed ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase text-white/40 tracking-wider">
                      Result
                    </span>
                  </div>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      isPassed ? "text-emerald-400" : "text-orange-400",
                    )}
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </div>
                </div>
              </motion.div>

              {/* Stat Card 2: Accuracy (Visual Bar) */}
              {!isBooted && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase text-white/40 tracking-wider">
                      Accuracy
                    </span>
                    <span className="text-sm font-bold text-white">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 1, duration: 1, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-full",
                        isPassed
                          ? "bg-linear-to-r from-emerald-400 to-blue-500"
                          : "bg-linear-to-r from-orange-500 to-red-500",
                      )}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex-1" />

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 mt-4"
              >
                {!isBooted && (
                  <Button
                    onPress={triggerConfetti}
                    className="w-full bg-white/5 text-white border border-white/10 hover:bg-white/10 font-semibold"
                    startContent={
                      <PartyPopper size={18} className="text-yellow-400" />
                    }
                  >
                    Celebrate
                  </Button>
                )}

                <Button
                  size="lg"
                  onPress={() => {
                    onReset();
                    window.location.reload();
                  }}
                  className={cn(
                    "w-full font-bold shadow-xl transition-all hover:scale-[1.02]",
                    isBooted
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                      : "bg-white text-black hover:bg-zinc-200 shadow-white/10",
                  )}
                  startContent={
                    isBooted ? <RotateCcw size={20} /> : <Home size={20} />
                  }
                >
                  {isBooted ? "Restart Session" : "Return to Dashboard"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-white/20 text-xs font-medium mt-6 uppercase tracking-widest"
        >
          Assessment Complete
        </motion.p>
      </motion.div>
    </div>
  );
};
