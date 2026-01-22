"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Listbox,
  ListboxItem,
  Spinner,
} from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
}

export function CategoryManager({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.categories.get();
      if (res.error) throw res.error;
      return res.data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.categories.post({ name });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategory("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.categories({ id }).delete();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    createMutation.mutate(newCategory);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Manage Categories
        </ModalHeader>
        <ModalBody>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              size="sm"
            />
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              size="sm"
              onPress={handleAdd}
              isLoading={createMutation.isPending}
            >
              <Plus size={20} />
            </Button>
          </div>

          <div className="min-h-50 max-h-100 overflow-y-auto border border-default-200 rounded-lg p-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            ) : categories?.length === 0 ? (
              <div className="text-center text-default-400 p-4">
                No categories found. Add one above.
              </div>
            ) : (
              <Listbox aria-label="Categories">
                {(categories || []).map((cat: Category) => (
                  <ListboxItem
                  className="bg-transparent!"
                    key={cat.id}
                    textValue={cat.name}
                    endContent={
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => deleteMutation.mutate(cat.id)}
                        isLoading={deleteMutation.isPending && deleteMutation.variables === cat.id}
                      >
                        <Trash2 size={16} />
                      </Button>
                    }
                  >
                    {cat.name}
                  </ListboxItem>
                ))}
              </Listbox>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
