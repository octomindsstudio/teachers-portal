"use client";

import { Button, Input, Card, CardBody } from "@heroui/react";
import { useRouter } from "@/hooks/useRouter";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [examCode, setExamCode] = useState("");

  const handleJoinExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (examCode.trim()) {
      router.push(`/exam/${examCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white mb-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          Teachers Portal
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
          The easiest way to create and take online exams.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-white/90 backdrop-blur-md">
          <CardBody className="p-8 gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Student?
              </h2>
              <p className="text-gray-500">Enter your exam code to begin</p>
            </div>

            <form onSubmit={handleJoinExam} className="flex flex-col gap-4">
              <Input
                size="lg"
                placeholder="Ex: AB12CD"
                value={examCode}
                onValueChange={setExamCode}
                classNames={{
                  input: "text-center text-xl uppercase font-bold",
                }}
              />
              <Button
                size="lg"
                color="primary"
                className="font-bold text-lg shadow-lg shadow-primary/40"
                type="submit"
                isDisabled={!examCode.trim()}
              >
                Start Exam
              </Button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/0 px-2 text-gray-400 font-medium bg-white">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="light"
                color="secondary"
                onPress={() => router.push("/admin")}
              >
                Login as Teacher / Admin
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
