"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Chip,
  Snippet,
  Spinner,
  Card,
  CardBody,
  addToast,
} from "@heroui/react";
import { api } from "@/lib/api-client";
import { Link } from "@/components/link";
import {
  ArrowLeft,
  Trophy,
  Timer,
  Users,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { StudentResultsTable } from "./_components/StudentResultsTable";
import { StatCard } from "../../_components/StatCard";

export default function ExamResultsPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();

  const {
    data: exam,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exam-results", code],
    queryFn: async () => {
      const res = await api.exams({ code }).results.get();
      if (res.error) throw res.error;
      return res.data as any;
    },
  });

  if (isLoading)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" label="Analyzing results..." color="primary" />
      </div>
    );

  if (error || !exam)
    return (
      <div className="p-10 text-center text-danger">
        <h2 className="text-2xl font-bold">Failed to load results</h2>
        <p>Please check the exam code or your internet connection.</p>
        <Button as={Link} href="/tpanel" className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );

  // --- ANALYTICS CALCULATIONS ---
  const attempts = exam.attempts || [];
  const totalAttempts = attempts.length;

  // 1. Pass Rate
  const passMark =
    exam.passMark ||
    (exam.questions?.reduce((acc: number, q: any) => acc + q.points, 0) || 0) *
      0.5; // Default 50% if not set
  const passedCount = attempts.filter((a: any) => a.score >= passMark).length;
  const passRate =
    totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  // 2. Average Score
  const avgScore =
    totalAttempts > 0
      ? (
          attempts.reduce((acc: number, curr: any) => acc + curr.score, 0) /
          totalAttempts
        ).toFixed(1)
      : "0.0";

  // 3. Time Analysis
  const durations = attempts
    .map((a: any) => {
      if (!a.finishedAt || !a.startedAt) return 0;
      return new Date(a.finishedAt).getTime() - new Date(a.startedAt).getTime();
    })
    .filter((d: number) => d > 0);

  const avgDurationMs =
    durations.length > 0
      ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length
      : 0;
  const avgDurationMins = Math.round(avgDurationMs / 60000);

  // 4. Total Points (Rough calc from questions if available, else infer max score seen?)
  const totalPoints =
    exam.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) ||
    100;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col gap-6 border-b border-default-200 pb-8">
        {/* Breadcrumb / Back Navigation */}
        <Link
          href="/tpanel"
          className="flex items-center gap-2 text-default-400 hover:text-default-900 transition-colors w-fit group"
        >
          <div className="p-1.5 rounded-lg bg-default-100 group-hover:bg-default-200 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="font-medium text-sm">Back to Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-default-900 tracking-tight">
                {exam.title}
              </h1>
            </div>

            <div className="flex items-center gap-6 text-default-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10 text-primary flex items-center">
                  <Timer size={16} />
                </div>
                <span>{exam.duration} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Exam Code:</span>
                <Snippet
                  symbol=""
                  variant="flat"
                  color="primary"
                  classNames={{ pre: "font-mono font-bold" }}
                >
                  {exam.code}
                </Snippet>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="flat"
              color="primary"
              onPress={() => {
                try {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/exam/${code}`,
                  );
                  addToast({
                    title: "Link Copied",
                    description:
                      "The exam link has been copied to your clipboard.",
                    color: "success",
                  });
                } catch (err) {
                  addToast({
                    title: "Failed to copy link",
                    description:
                      "The exam link could not be copied to your clipboard.",
                    color: "danger",
                  });
                }
              }}
              startContent={<Copy size={18} />}
            >
              Share Link
            </Button>
            <Button
              onPress={() => router.push(`/tpanel/exam/${code}/edit`)}
              color="primary"
              className="font-bold shadow-lg shadow-primary/20"
            >
              Edit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Score"
          value={avgScore}
          icon={<Trophy size={24} />}
          color="warning"
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={<CheckCircle2 size={24} />}
          color={
            passRate > 70 ? "success" : passRate > 40 ? "warning" : "danger"
          }
        />
        <StatCard
          title="Avg Time"
          value={`${avgDurationMins}m`}
          icon={<Timer size={24} />}
          color="primary"
        />
        <StatCard
          title="Total Attempts"
          value={totalAttempts}
          icon={<Users size={24} />}
          color="secondary"
        />
      </div>

      {/* --- CHARTS & DATA --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Recent Results</h2>
          {/* Search/Filter inputs could go here */}
        </div>
        <StudentResultsTable attempts={attempts} passMark={passMark} />
      </div>
    </div>
  );
}
