"use client";

import { useRouter } from "@/hooks/useRouter";
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
} from "@heroui/react";
import { AlertCircle, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";

interface StudentResultsTableProps {
  attempts: any[];
  passMark: number;
}

export const StudentResultsTable = ({
  attempts,
  passMark,
}: StudentResultsTableProps) => {
  const router = useRouter();
  if (attempts.length === 0) {
    return (
      <div className="text-center py-20 text-default-400 bg-default-50 rounded-2xl border-2 border-dashed border-default-200">
        No attempts yet. Share the code to get started!
      </div>
    );
  }

  const formatDuration = (start: string | Date, end: string | Date) => {
    if (!start || !end) return "-";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Table
      aria-label="Student Results"
      className="bg-content1 rounded-2xl shadow-sm"
      selectionMode="none"
    >
      <TableHeader>
        <TableColumn>STUDENT</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>SCORE</TableColumn>
        <TableColumn>TIME TAKEN</TableColumn>
        <TableColumn>INTEGRITY</TableColumn>
        <TableColumn align="end">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody items={attempts}>
        {(item: any) => (
          <TableRow
            key={item.id}
            className="hover:bg-default-100/50 transition-colors"
          >
            <TableCell>
              <User
                name={item.studentName}
                description={new Date(item.finishedAt).toLocaleDateString()}
                avatarProps={{
                  name: item.studentName?.charAt(0).toUpperCase(),
                  className: "bg-primary/10 text-primary font-bold radius-lg",
                }}
              />
            </TableCell>
            <TableCell>
              {item.score >= passMark ? (
                <Chip
                  startContent={<CheckCircle2 size={14} />}
                  color="success"
                  variant="flat"
                  size="sm"
                >
                  Passed
                </Chip>
              ) : (
                <Chip
                  startContent={<XCircle size={14} />}
                  color="danger"
                  variant="flat"
                  size="sm"
                >
                  Failed
                </Chip>
              )}
            </TableCell>
            <TableCell>
              <div className="font-bold text-lg">
                {item.score}{" "}
                <span className="text-xs text-default-400 font-normal">
                  pts
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-default-500 font-mono text-sm">
                <Clock size={14} />
                {formatDuration(item.startedAt, item.finishedAt)}
              </div>
            </TableCell>
            <TableCell>
              {item.strikes > 0 ? (
                <Tooltip
                  content={`${item.strikes} suspicious activities detected`}
                >
                  <Chip
                    startContent={<AlertCircle size={14} />}
                    color="warning"
                    variant="flat"
                    size="sm"
                  >
                    {item.strikes} Strikes
                  </Chip>
                </Tooltip>
              ) : (
                <Chip
                  color="success"
                  variant="dot"
                  size="sm"
                  classNames={{ base: "border-none bg-transparent pl-0" }}
                >
                  Clean
                </Chip>
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button
                  onPress={() =>
                    router.push(
                      `/tpanel/exam/${window.location.pathname.split("/")[3]}/attempt/${item.id}`,
                    )
                  }
                  size="sm"
                  variant="light"
                  isIconOnly
                >
                  <Eye size={18} className="text-default-400" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
