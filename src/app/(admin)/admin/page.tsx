"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";
import Link from "next/link";
import { api } from "@/lib/api-client";

export default function AdminDashboard() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams-list"],
    queryFn: async () => {
      const res = await api.exams.list.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          as={Link}
          href="/admin/create"
          color="primary"
          className="font-bold"
        >
          + Create New Exam
        </Button>
      </div>

      <Card>
        <CardBody>
          {exams && exams.length > 0 ? (
            <Table aria-label="Example table with dynamic content">
              <TableHeader>
                <TableColumn key="title">TITLE</TableColumn>
                <TableColumn key="code">CODE</TableColumn>
                <TableColumn key="duration">DURATION</TableColumn>
                <TableColumn key="_count">ATTEMPTS</TableColumn>
                <TableColumn key="createdAt">CREATED</TableColumn>
              </TableHeader>
              <TableBody items={exams}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => {
                      if (columnKey === "title")
                        return (
                          <TableCell>
                            <Link
                              href={`/admin/exam/${item.code}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {item.title}
                            </Link>
                          </TableCell>
                        );
                      if (columnKey === "_count")
                        return <TableCell>{(item as any)?._count.attempts}</TableCell>;
                      if (columnKey === "createdAt")
                        return (
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                        );
                      return (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      );
                    }}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No exams found. Create your first one!
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
