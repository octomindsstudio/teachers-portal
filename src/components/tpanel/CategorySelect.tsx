"use client";

import { useQuery } from "@tanstack/react-query";
import { Select, SelectItem, Button, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { CategoryManager } from "./CategoryManager";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

interface Category {
  id: string;
  name: string;
}

export function CategorySelect({
  value,
  onChange,
  error,
}: CategorySelectProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.categories.get();
      if (res.error) throw res.error;
      return res.data as Category[];
    },
  });

  return (
    <>
      <div className="flex gap-2 items-start">
        <Select
          label="Category"
          placeholder="Select a category"
          selectedKeys={value ? [value] : []}
          onChange={(e) => onChange(e.target.value)}
          variant="bordered"
          labelPlacement="outside"
          className="flex-1"
          errorMessage={error}
          isInvalid={!!error}
          isLoading={isLoading}
        >
          {(categories || []).map((cat: Category) => (
            <SelectItem key={cat.id} textValue={cat.name} onPress={() => onChange(cat.id)}>
              {cat.name}
            </SelectItem>
          ))}
        </Select>
        <Button
          isIconOnly
          variant="flat"
          color="primary"
          className="mt-6" // align with input field, skipping label
          onPress={onOpen}
        >
          <Plus size={20} />
        </Button>
      </div>

      <CategoryManager isOpen={isOpen} onClose={onClose} />
    </>
  );
}
