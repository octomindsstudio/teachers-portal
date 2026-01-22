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
import { useAuthStore } from "@/store/auth-store";

// Zod Schema
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPageView() {
  const router = useRouter();
  const { syncSession } = useAuthStore();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  // Mutation for Login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginValues) => {
      const { data: authData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials");
      }
      return authData;
    },
    onSuccess: async () => {
      await syncSession();
      router.push("/tpanel");
    },
  });

  // Query for Random Quote
  const { data: quote } = useQuery({
    queryKey: ["login-quote"],
    queryFn: () => getRandomQuote(),
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const onSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-black selection:bg-brand-indigo/20 selection:text-brand-indigo">
      {/* Left Panel - The Clean Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-[40%] flex flex-col justify-center p-12 lg:p-20 relative z-10"
      >
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 flex items-center gap-3 text-brand-indigo">
            <div className="p-2.5 bg-brand-indigo/10 rounded-xl border border-brand-indigo/20">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-black">
              TeachersPortal
            </span>
          </div>

          <div className="space-y-2 mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-black">
              Welcome back
            </h1>
            <p className="text-slate-500 text-lg">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-14">
            <div className="space-y-10">
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
                    "border-slate-300 hover:border-slate-500 focus-within:border-brand-indigo! transition-all shadow-sm hover:shadow-md h-12",
                  label: "text-slate-500! font-semibold text-sm pb-1.5",
                  input: "text-base text-black placeholder:text-slate-500/50",
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
                    "border-slate-300 hover:border-slate-500 focus-within:border-brand-indigo! transition-all shadow-sm hover:shadow-md h-12",
                  label: "text-slate-500! font-semibold text-sm pb-1.5",
                  input: "text-base text-black placeholder:text-slate-500/50",
                }}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
              />
            </div>

            {loginMutation.error && (
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
                    Authentication Failed
                  </p>
                  <p className="text-sm text-rose-600 mt-0.5">
                    {loginMutation.error.message}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-end pt-1">
              <Link
                href="#"
                className="text-sm font-semibold text-brand-indigo hover:text-brand-indigo/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-indigo text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-brand-indigo/25 hover:bg-brand-indigo/90 hover:shadow-brand-indigo/40 hover:-translate-y-0.5 transition-all duration-200"
              isLoading={loginMutation.isPending}
              endContent={
                !loginMutation.isPending && (
                  <ArrowRight size={18} strokeWidth={2.5} />
                )
              }
            >
              Sign in
            </Button>
          </form>

          <div className="mt-10 text-center text-slate-500 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-brand-indigo hover:text-brand-indigo/80 transition-colors ml-1"
            >
              Sign up for free
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
      <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-visual-dark items-center justify-center">
        {/* Elegant Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-brand-indigo/20 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] [radial-gradient(ellipse_60%_60%_at_50%_50%,#000_100%,transparent_100%)]" />
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
              <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-brand-indigo/10 border border-brand-indigo/20 rounded-full text-brand-indigo/90 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-pulse" />
                Educator Platform
              </div>
              <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-[1.15] mb-10 tracking-tight">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-linear-to-tr from-brand-indigo to-brand-indigo/70 p-0.5 shadow-xl shadow-brand-indigo/20">
                  <div className="w-full h-full rounded-full bg-visual-dark flex items-center justify-center border border-white/10">
                    <span className="text-brand-indigo/50 font-serif text-xl italic">
                      {quote.author[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    {quote.author}
                  </div>
                  <div className="text-brand-indigo/80 text-sm font-medium">
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
