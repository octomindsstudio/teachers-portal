"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  Input,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";
import { api } from "@/lib/api-client";
import { useState } from "react";
import { Plus, Trash2, Search, Tag } from "lucide-react";
import { addToast } from "@heroui/react";

interface Category {
  id: string;
  name: string;
  _count?: {
    exams: number;
  };
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Fetch Categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.categories.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.categories.post({ name });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategory("");
      addToast({ title: "Category created successfully", color: "success" });
    },
    onError: (err) => {
      addToast({ title: "Failed to create category", color: "danger" });
      console.error(err);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.categories({ id }).delete();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      addToast({ title: "Category deleted successfully", color: "success" });
    },
    onError: (err) => {
      addToast({ title: "Failed to delete category", color: "danger" });
      console.error(err);
    },
  });

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    createMutation.mutate(newCategory);
  };

  const filteredCategories = (categories || []).filter((cat: any) =>
    cat.name.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const columns = [
    { key: "name", label: "NAME" },
    // { key: "count", label: "EXAMS" }, // Add this if backend supports it later
    { key: "actions", label: "ACTIONS" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Categories
          </h1>
          <p className="text-default-500 text-sm mt-1">
            Manage subject categories for your exams
          </p>
        </div>
      </div>

      <Card className="border border-default-200 shadow-sm">
        <CardBody className="p-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder="Search by name..."
              startContent={<Search className="text-default-300" size={16} />}
              value={filterValue}
              onClear={() => setFilterValue("")}
              onValueChange={setFilterValue}
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="New category name"
                value={newCategory}
                onValueChange={setNewCategory}
                className="w-full sm:w-64"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <Button
                color="primary"
                onPress={handleAdd}
                isLoading={createMutation.isPending}
                startContent={
                  createMutation.isPending ? null : <Plus size={18} />
                }
              >
                Add
              </Button>
            </div>
          </div>

          <Table
            aria-label="Categories table"
            shadow="none"
            selectionMode="none"
            classNames={{ wrapper: "px-0" }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  align={column.key === "actions" ? "end" : "start"}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredCategories}
              emptyContent={isLoading ? "Loading..." : "No categories found"}
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." />}
            >
              {(item: any) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {columnKey === "actions" ? (
                        <div className="relative flex justify-end items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => deleteMutation.mutate(item.id)}
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === item.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </div>
                      ) : (
                        getKeyValue(item, columnKey)
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
