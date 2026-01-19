"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { api } from "@/lib/api-client";
import { Link } from "@/components/link";

export default function ExamResultsPage() {
  const params = useParams();
  const code = params.code as string;

  const {
    data: exam,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exam-results", code],
    queryFn: async () => {
      const res = await api.exams({ code }).results.get();
      if (res.error) throw res.error;
      // Eden inference might skip nested includes, so we cast it
      return res.data as any; // Temporary cast to fix build, though ideally we define the type
    },
  });

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (error || !exam)
    return <div className="p-10 text-red-500">Error loading results.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-gray-500">
            Code:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {exam.code}
            </span>
          </p>
        </div>
        <Link href="/tpanel" className="text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Total Attempts</p>
            <p className="text-3xl font-bold">{exam.attempts.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-3xl font-bold">
              {exam.attempts.length > 0
                ? (
                    exam.attempts.reduce(
                      (acc: any, curr: any) => acc + curr.score,
                      0,
                    ) / exam.attempts.length
                  ).toFixed(1)
                : "-"}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Student Results</h2>
          {exam.attempts.length > 0 ? (
            <Table aria-label="Results table">
              <TableHeader>
                <TableColumn>STUDENT NAME</TableColumn>
                <TableColumn>SCORE</TableColumn>
                <TableColumn>DATE</TableColumn>
              </TableHeader>
              <TableBody>
                {exam.attempts.map((attempt: any) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">
                      {attempt.studentName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          attempt.score >= exam.passMark ? "success" : "warning"
                        }
                        variant="flat"
                      >
                        {attempt.score} pts
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {new Date(attempt.finishedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No attempts yet. Share the code <b>{exam.code}</b> with your
              students!
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
