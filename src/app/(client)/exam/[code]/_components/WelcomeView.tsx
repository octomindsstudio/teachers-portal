"use client";

import React from "react";
import { motion } from "framer-motion";
import { Chip, Input, Button } from "@heroui/react";
import { Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { AttemptSchema } from "./schema";

interface WelcomeViewProps {
  exam: any;
  register: UseFormRegister<AttemptSchema>;
  watch: UseFormWatch<AttemptSchema>;
  isValid: boolean;
  onStart: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  exam,
  register,
  watch,
  isValid,
  onStart,
}) => {
  return (
    <motion.div
      key="welcome"
      className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary-foreground text-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
      transition={{ duration: 0.6 }}
    >
      {/* Immersive Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/exam-hero.png"
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-110 active-exam-bg-anim"
          alt="Background"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-black/90 via-black/60 to-black/20" />

        {/* Floating Orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Main Bento Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 perspective-1000">
        <motion.div
          className="md:col-span-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl p-5 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:bg-white/10 transition-colors duration-500"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{
            y: -4,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine z-0 pointer-events-none" />

          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-500 text-white">
            <svg
              className="w-64 h-64 rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>

          <div className="relative z-10 mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight drop-shadow-xl">
              {exam.title}
            </h1>
            {exam.description ? (
              <p className="text-lg text-white/60 font-medium max-w-lg leading-relaxed">
                {exam.description}
              </p>
            ) : (
              <p className="text-lg text-white/40 font-medium italic">
                No description provided.
              </p>
            )}
          </div>

          <div className="relative z-10 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Owner Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 p-px shadow-lg">
                <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                  {exam.teacher?.image ? (
                    <img
                      src={exam.teacher.image}
                      alt={exam.teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-white text-sm">
                      {exam.teacher?.name?.charAt(0) || "T"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                  Created By
                </span>
                <span className="text-white font-bold text-sm leading-none truncate max-w-30">
                  {exam.teacher?.name || "Instructor"}
                </span>
              </div>
            </div>

            {/* Duration Info */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                  Duration
                </span>
                <span className="text-white font-black text-xl leading-none flex items-baseline gap-1">
                  {exam.duration}
                  <span className="text-[10px] text-white/40 font-medium">
                    mins
                  </span>
                </span>
              </div>
            </div>

            {/* Questions Info */}
            <div className="flex items-center gap-3 lg:border-l border-white/10 lg:pl-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                  Questions
                </span>
                <span className="text-white font-black text-xl leading-none flex items-baseline gap-1">
                  {exam.questions.length}
                  <span className="text-[10px] text-white/40 font-medium">
                    items
                  </span>
                </span>
              </div>
            </div>

            {/* Attempts Info */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                  Total Attempts
                </span>
                <span className="text-white font-black text-xl leading-none flex items-baseline gap-1">
                  {exam._count?.attempts ?? 0}
                  <span className="text-[10px] text-white/40 font-medium">
                    submitted
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-8" />

          <div className="flex flex-col md:flex-row items-end gap-4 relative z-10">
            <Input
              {...register("studentName")}
              label="Name"
              placeholder="Enter your full name"
              variant="bordered"
              labelPlacement="outside"
              size="lg"
              isRequired
              classNames={{
                mainWrapper: "group w-full",
                inputWrapper:
                  "bg-black/20 border-white/10 hover:border-primary/50 focus-within:border-primary/80 focus-within:bg-black/40 shadow-inner  rounded-2xl transition-all",
                label:
                  "text-white/40! font-bold uppercase text-[10px] tracking-[0.2em] mb-3 group-hover:text-primary transition-colors",
                input:
                  "text-xl font-bold text-white placeholder:text-white/20 font-mono",
              }}
              className="flex-1"
            />

            <Button
              size="md"
              className="w-full md:w-auto md:min-w-75 font-bold text-lg h-12 rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] bg-linear-to-r from-primary via-blue-600 to-indigo-600 text-white border-t border-white/20 relative overflow-hidden group"
              onPress={onStart}
              isDisabled={!isValid}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-3">
                Enter
                <ChevronRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
