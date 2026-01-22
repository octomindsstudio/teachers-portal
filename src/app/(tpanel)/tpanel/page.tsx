"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Link } from "@/components/link";
import { api } from "@/lib/api-client";
import { StatCard } from "./_components/StatCard";
import { ExamListTable } from "./_components/ExamListTable";
import { LayoutDashboard, Plus, Users, FileCheck2, Trophy } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function TeacherDashboard() {
  const { user } = useAuthStore();

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams-list"],
    queryFn: async () => {
      const res = await api.exams.list.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

  // Calculate Stat Aggregates
  const totalExams = exams?.length || 0;

  let totalAttempts = 0;
  let totalScoreSum = 0;
  const uniqueStudents = new Set<string>();

  exams?.forEach((exam: any) => {
    totalAttempts += exam._count.attempts;
    if (exam.attempts) {
      exam.attempts.forEach((att: any) => {
        totalScoreSum += att.score; // Note: This is absolute score, not percentage.
        // To get % avg, we need max points. We don't have max points in this list query easily unless we sum question points.
        // For now, let's just show "Avg Points" or try to fetch max points.
        // Schema: Exam -> Questions -> Points.
        // My list query didn't include questions.
        // Let's rely on "Total Attempts" and "Unique Students" which are correct.
        if (att.studentName) uniqueStudents.add(att.studentName);
      });
    }
  });

  const totalStudents = uniqueStudents.size;
  // const avgScore = totalAttempts > 0 ? (totalScoreSum / totalAttempts).toFixed(1) : "N/A";

  return (
    <div className="p-8 space-y-8 max-w-400 mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-default-900">Dashboard</h1>
          <p className="text-default-500 font-medium mt-1">
            Welcome back,{" "}
            <span className="text-primary font-bold">{user?.name}</span>. Here's
            what's happening.
          </p>
        </div>
        <Button
          as={Link}
          href="/tpanel/create"
          color="primary"
          size="lg"
          className="font-bold shadow-lg shadow-primary/20"
          startContent={<Plus size={20} strokeWidth={3} />}
        >
          Create Assessment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Exams"
          value={totalExams}
          icon={<FileCheck2 size={24} />}
          color="primary"
          // trend="12%"
          // trendUp={true} // Removing fake trend
        />
        <StatCard
          title="Total Attempts"
          value={totalAttempts}
          icon={<Users size={24} />}
          color="secondary"
          // trend="8%"
          // trendUp={true}
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<Trophy size={24} />}
          color="success"
          // trend="2%"
          // trendUp={true}
        />
      </div>

      {/* Recent Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-default-400" size={20} />
            Recent Assessments
          </h2>
        </div>

        <ExamListTable exams={exams || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
