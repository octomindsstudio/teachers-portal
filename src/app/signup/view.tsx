"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input } from "@heroui/react";
import { Link } from "@/components/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/hooks/useRouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, ShieldAlert } from "lucide-react";
import { getRandomQuote } from "@/lib/quotes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DEVELOPED_BY, DEVELOPED_BY_URL } from "@/constants";

// Zod Schema
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPageView() {
  const router = useRouter();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  // Mutation for SignUp
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpValues) => {
      const { data: authData, error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (error) {
        throw new Error(error.message || "Failed to sign up");
      }
      return authData;
    },
    onSuccess: () => {
      router.push("/tpanel");
    },
  });

  // Query for Random Quote
  const { data: quote } = useQuery({
    queryKey: ["signup-quote"],
    queryFn: () => getRandomQuote(),
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const onSubmit = (data: SignUpValues) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Left Panel - The Clean Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-[40%] flex flex-col justify-center p-12 lg:p-20 relative z-10"
      >
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 flex items-center gap-3 text-teal-600">
            <div className="p-2.5 bg-teal-50/80 rounded-xl border border-teal-100">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              TeachersPortal
            </span>
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Create Account
            </h1>
            <p className="text-slate-500 text-lg">
              Join our community of over 10,000 educators.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-14">
            <div className="space-y-10">
              <Input
                {...register("name")}
                type="text"
                label="Full Name"
                labelPlacement="outside"
                placeholder="John Doe"
                variant="bordered"
                radius="md"
                classNames={{
                  inputWrapper:
                    "border-slate-300 hover:border-slate-500 focus-within:border-teal-600! transition-all shadow-sm hover:shadow-md h-12",
                  label: "text-slate-500! font-semibold text-sm pb-1.5",
                  input:
                    "text-base text-slate-900 placeholder:text-slate-500/50",
                }}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <Input
                {...register("email")}
                type="email"
                label="Email Address"
                labelPlacement="outside"
                placeholder="teacher@school.edu"
                variant="bordered"
                radius="md"
                classNames={{
                  inputWrapper:
                    "border-slate-300 hover:border-slate-500 focus-within:border-teal-600! transition-all shadow-sm hover:shadow-md h-12",
                  label: "text-slate-500! font-semibold text-sm pb-1.5",
                  input:
                    "text-base text-slate-900 placeholder:text-slate-500/50",
                }}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <Input
                {...register("password")}
                type="password"
                label="Password"
                labelPlacement="outside"
                placeholder="••••••••"
                variant="bordered"
                radius="md"
                classNames={{
                  inputWrapper:
                    "border-slate-300 hover:border-slate-500 focus-within:border-teal-600! transition-all shadow-sm hover:shadow-md h-12",
                  label: "text-slate-500! font-semibold text-sm pb-1.5",
                  input:
                    "text-base text-slate-900 placeholder:text-slate-500/50",
                }}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
              />
            </div>

            {signUpMutation.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3"
              >
                <div className="p-1 bg-rose-100 rounded-full mt-0.5">
                  <ShieldAlert size={16} className="text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-700">
                    Registration Failed
                  </p>
                  <p className="text-sm text-rose-600 mt-0.5">
                    {signUpMutation.error.message}
                  </p>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-600 text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-teal-600/25 hover:bg-teal-700 hover:shadow-teal-600/40 hover:-translate-y-0.5 transition-all duration-200"
              isLoading={signUpMutation.isPending}
              endContent={
                !signUpMutation.isPending && (
                  <ArrowRight size={18} strokeWidth={2.5} />
                )
              }
            >
              Get Started
            </Button>
          </form>

          <div className="mt-10 text-center text-slate-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-teal-600 hover:text-teal-800 transition-colors ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-0 w-full text-center text-xs font-medium text-slate-400"
          suppressHydrationWarning
        >
          &copy; {new Date().getFullYear()}{" "}
          <a
            href={DEVELOPED_BY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold"
          >
            {DEVELOPED_BY}
          </a>
          . All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel - The Rich Visual */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-[#0F3935] items-center justify-center">
        {/* Elegant Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_100%,transparent_100%)]" />
        </div>

        <AnimatePresence mode="wait">
          {quote && (
            <motion.div
              key={quote.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 max-w-lg p-12"
            >
              <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-400/20 rounded-full text-teal-300/90 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Join the Movement
              </div>
              <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-[1.15] mb-10 tracking-tight">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-linear-to-tr from-teal-400 to-teal-600 p-0.5 shadow-xl shadow-teal-900/20">
                  <div className="w-full h-full rounded-full bg-[#0F3935] flex items-center justify-center border border-white/10">
                    <span className="text-teal-200 font-serif text-xl italic">
                      {quote.author[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    {quote.author}
                  </div>
                  <div className="text-teal-300/80 text-sm font-medium">
                    {quote.role}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
