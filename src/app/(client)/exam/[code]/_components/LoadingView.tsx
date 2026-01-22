"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react";

export const LoadingView = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Authenticating user...", icon: Lock },
    { text: "Verifying exam permissions...", icon: ShieldCheck },
    { text: "Connecting to secure server...", icon: Server },
    { text: "Preparing assessment environment...", icon: FileCheck },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[step].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fc] relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-125 h-125 bg-primary/5 rounded-full animate-pulse blur-3xl" />
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        <div className="relative">
          {/* Spinner Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

          {/* Centered Icon Fading In/Out */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-primary"
            >
              <CurrentIcon size={28} />
            </motion.div>
          </div>
        </div>

        <div className="h-8 flex items-center justify-center overflow-hidden">
          <motion.p
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-default-500 font-medium text-lg"
          >
            {steps[step].text}
          </motion.p>
        </div>

        {/* Progress Bits */}
        <div className="flex gap-2 mt-2">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                opacity: i <= step ? 1 : 0.2,
                scale: i === step ? 1.2 : 1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
