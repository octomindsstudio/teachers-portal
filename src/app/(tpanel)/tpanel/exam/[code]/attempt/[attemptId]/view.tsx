"use client";

import { User, Chip, CircularProgress, Card, CardBody } from "@heroui/react";
import { Link } from "@/components/link";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { QuestionReviewCard } from "./_components/QuestionReviewCard";

interface AttemptDetailsViewProps {
  code: string;
  attempt: any;
}

export default function AttemptDetailsView({
  code,
  attempt,
}: AttemptDetailsViewProps) {
  const exam = attempt.exam;
  const questions = exam?.questions || [];

  // Calculate max score
  const maxScore = questions.reduce((acc: number, q: any) => acc + q.points, 0);
  const passMark = exam.passMark || maxScore * 0.5;
  const isPassed = attempt.score >= passMark;
  const percentage = Math.round((attempt.score / maxScore) * 100) || 0;

  // Duration
  let durationStr = "-";
  if (attempt.startedAt && attempt.finishedAt) {
    const diff =
      new Date(attempt.finishedAt).getTime() -
      new Date(attempt.startedAt).getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    durationStr = `${mins}m ${secs}s`;
  }

  return (
    <div className="min-h-screen bg-default-50/50 pb-20">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        {/* --- HEADER --- */}
        <div className="space-y-6">
          <Link
            href={`/tpanel/exam/${code}`}
            className="flex items-center gap-2 text-default-400 hover:text-default-900 transition-colors text-sm font-medium w-fit group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Class Results
          </Link>

          <Card className="border-none shadow-lg bg-linear-to-br from-white to-default-50 overflow-hidden relative">
            {/* Decorative background splashes */}
            <div
              className={`absolute top-0 right-0 w-64 h-64 opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 ${isPassed ? "bg-success" : "bg-danger"}`}
            />

            <CardBody className="p-0 flex flex-col md:flex-row">
              {/* Left: Student & Meta */}
              <div className="p-8 flex-1 space-y-6 relative z-10">
                <div className="flex items-start justify-between">
                  <User
                    name={
                      <span className="text-xl font-bold text-default-900">
                        {attempt.studentName}
                      </span>
                    }
                    description={
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-default-500 font-medium text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(attempt.finishedAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    }
                    avatarProps={{
                      name: attempt.studentName[0],
                      className:
                        "w-16 h-16 text-2xl font-bold rounded-3xl shadow-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white",
                    }}
                  />
                  {attempt.strikes > 0 ? (
                    <Chip
                      color="warning"
                      variant="flat"
                      startContent={<AlertTriangle size={14} />}
                      className="border border-warning-200"
                    >
                      {attempt.strikes} Strikes
                    </Chip>
                  ) : (
                    <Chip
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle2 size={14} />}
                      className="border border-success-200 bg-success-50"
                    >
                      Clean Session
                    </Chip>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-default-100/50 border border-default-200 flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm text-default-500">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                        Time Taken
                      </p>
                      <p className="font-bold text-default-700">
                        {durationStr}
                      </p>
                    </div>
                  </div>
                  {/* Potentially add more stats like "Answered 10/10" here */}
                </div>
              </div>

              {/* Right: Score Stats */}
              <div className="md:w-[320px] bg-default-50/50 border-l border-default-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <CircularProgress
                    classNames={{
                      svg: "w-36 h-36 drop-shadow-md",
                      indicator: isPassed ? "stroke-success" : "stroke-danger",
                      track: "stroke-default-200",
                      value: "text-3xl font-black text-default-900",
                    }}
                    value={percentage}
                    strokeWidth={3}
                    showValueLabel={true}
                    aria-label="Score Percentage"
                  />
                  <div className="absolute top-[65%] text-xs font-semibold text-default-400 uppercase tracking-widest">
                    Score
                  </div>
                </div>

                <div className="mt-4 text-center space-y-1 z-10">
                  <div className="text-sm font-medium text-default-500">
                    {attempt.score} / {maxScore} Points
                  </div>
                  <Chip
                    size="sm"
                    className="font-bold uppercase tracking-wider h-6"
                    color={isPassed ? "success" : "danger"}
                    variant="dot"
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* --- QUESTIONS --- */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold px-1 text-default-700">
            Detailed Review
          </h3>
          <div className="space-y-6">
            {questions.map((q: any, i: number) => {
              const answer = attempt.answers.find(
                (a: any) => a.questionId === q.id,
              );
              return (
                <QuestionReviewCard
                  key={q.id}
                  index={i}
                  question={q}
                  answer={answer}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
