"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Button,
  Pagination,
  Spinner,
} from "@heroui/react";
import { Link } from "@/components/link";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "@/hooks/useRouter";

interface ExamListTableProps {
  exams: any[];
  isLoading: boolean;
}

export const ExamListTable = ({ exams, isLoading }: ExamListTableProps) => {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center py-20">
        <Spinner size="lg" label="Loading exams..." />
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="text-center py-20 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
        <div className="bg-default-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <FileText size={40} className="text-default-400" />
        </div>
        <h3 className="text-xl font-bold text-default-900 mb-2">
          No Exams Created Yet
        </h3>
        <p className="text-default-500 mb-6">
          Get started by creating your first assessment.
        </p>
        <Button
          as={Link}
          href="/tpanel/create"
          color="primary"
          className="font-bold shadow-lg shadow-primary/20"
        >
          Create New Exam
        </Button>
      </div>
    );
  }

  return (
    <Table
      aria-label="Exam List"
      className="bg-content1 rounded-2xl shadow-sm"
      selectionMode="none"
    >
      <TableHeader>
        <TableColumn>EXAM</TableColumn>
        <TableColumn>CODE</TableColumn>
        <TableColumn>ATTEMPTS</TableColumn>
        <TableColumn>CREATED</TableColumn>
        <TableColumn align="end">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody items={exams}>
        {(item: any) => (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-default-100/50 transition-colors"
            onClick={()=> router.push(`/tpanel/exam/${item.code}`)}
          >
            <TableCell>
              <div className="flex flex-col">
                <h2 className="font-bold">{item.title}</h2>
                <span className="text-default-400">{item.duration} mins</span>
              </div>
            </TableCell>
            <TableCell>
              <Chip variant="flat" size="sm" className="font-mono">
                {item.code}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  {item._count.attempts}
                </span>
                <span className="text-xs text-default-500">submissions</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-default-500 text-sm">
                <Calendar size={14} />
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="relative flex justify-end items-center gap-2">
                <Tooltip content="View Results">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    as={Link}
                    href={`/tpanel/exam/${item.code}`}
                    className="text-default-400 hover:text-primary"
                  >
                    <Eye size={20} />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
