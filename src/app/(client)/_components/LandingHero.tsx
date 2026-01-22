"use client";

import { Button, Input, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingHero() {
  const router = useRouter();
  const [examCode, setExamCode] = useState("");

  const handleJoinExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (examCode.trim()) {
      router.push(`/exam/${examCode.trim()}`);
    }
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now with AI-powered features
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-default-900 leading-[1.1]">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Online Exams
                </span>
              </h1>
              <p className="text-xl text-default-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Seamlessly create, manage, and grade exams with our advanced
                portal. Designed for modern educators and students.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                color="primary"
                className="font-semibold text-lg px-8 h-14 shadow-xl shadow-primary/25"
                endContent={<ArrowRight size={20} />}
                onPress={() => router.push("/admin")}
              >
                Create an Exam
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="font-semibold text-lg px-8 h-14"
                onPress={() =>
                  document
                    .getElementById("join-exam")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Join as Student
              </Button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-default-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>Free for everyone</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md lg:max-w-xl"
            id="join-exam"
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 animate-pulse" />

              <Card className="border border-default-100 shadow-2xl bg-white/80 backdrop-blur-xl">
                <CardBody className="p-8 gap-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-default-900">
                      Student Access
                    </h2>
                    <p className="text-default-500">
                      Enter your unique exam code to begin
                    </p>
                  </div>

                  <form
                    onSubmit={handleJoinExam}
                    className="flex flex-col gap-4"
                  >
                    <div className="space-y-1">
                      <Input
                        size="lg"
                        placeholder="Ex: AB12CD"
                        value={examCode}
                        onValueChange={(val) => setExamCode(val.toUpperCase())}
                        classNames={{
                          input:
                            "text-center text-2xl uppercase font-bold tracking-widest placeholder:tracking-normal",
                          inputWrapper:
                            "h-16 bg-default-50 hover:bg-default-100 border-2 border-default-200 focus-within:border-primary transition-all shadow-inner",
                        }}
                      />
                    </div>
                    <Button
                      size="lg"
                      color="primary"
                      className="font-bold text-lg h-14 shadow-lg shadow-primary/40 transform active:scale-[0.98] transition-all"
                      type="submit"
                      isDisabled={!examCode.trim()}
                    >
                      Start Exam
                    </Button>
                  </form>

                  <div className="p-4 bg-default-50 rounded-xl border border-default-100 text-center">
                    <p className="text-xs text-default-400">
                      By joining, you verify that you are the intended student
                      for this exam.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
