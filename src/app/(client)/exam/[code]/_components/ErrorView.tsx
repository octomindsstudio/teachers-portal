"use client";

import { motion } from "framer-motion";
import { SearchX, Home } from "lucide-react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export const ErrorView = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fc] p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full flex flex-col items-center"
      >
        <div className="w-32 h-32 bg-default-100 rounded-full flex items-center justify-center mb-8">
          <SearchX size={64} className="text-default-400" />
        </div>

        <h1 className="text-3xl font-bold text-default-900 mb-3">
          Assessment Not Found
        </h1>

        <p className="text-default-500 text-lg leading-relaxed mb-8 max-w-[320px]">
          We couldn't locate the exam you're looking for. It may have been
          removed or the link is invalid.
        </p>

        <Button
          size="lg"
          color="primary"
          variant="shadow"
          className="font-bold px-8"
          startContent={<Home size={20} />}
          onPress={() => router.push("/")}
        >
          Return Home
        </Button>
      </motion.div>
    </div>
  );
};
