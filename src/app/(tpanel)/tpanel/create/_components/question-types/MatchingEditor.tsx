"use client";

import { Control, UseFormRegister, useFieldArray } from "react-hook-form";
import { Button, Input } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { FormValues } from "../../schema";

interface MatchingEditorProps {
  index: number;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
}

export function MatchingEditor({
  index,
  register,
  control,
}: MatchingEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.pairs` as any,
  });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {fields.map((pair, pIndex) => (
          <div
            key={pair.id}
            className="group/pair flex items-center p-2 rounded-xl border border-default-200 bg-white hover:border-primary/50 transition-colors shadow-sm relative"
          >
            {/* Left Item */}
            <div className="flex-1 bg-default-50 rounded-lg p-1 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
              <Input
                {...register(`questions.${index}.pairs.${pIndex}.left` as any)}
                placeholder={`Prompt ${pIndex + 1}`}
                size="sm"
                variant="flat"
                classNames={{
                  inputWrapper:
                    "bg-transparent shadow-none hover:bg-transparent px-2",
                  input: "text-small font-medium text-default-700",
                }}
              />
            </div>

            {/* Connection Visual */}
            <div className="px-3 flex flex-col items-center justify-center text-default-300">
              <div className="w-8 h-px bg-default-300"></div>
            </div>

            {/* Right Item */}
            <div className="flex-1 bg-primary/5 rounded-lg p-1 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
              <Input
                {...register(`questions.${index}.pairs.${pIndex}.right` as any)}
                placeholder={`Match ${pIndex + 1}`}
                size="sm"
                variant="flat"
                classNames={{
                  inputWrapper:
                    "bg-transparent shadow-none hover:bg-transparent px-2",
                  input: "text-small font-medium text-default-700",
                }}
              />
            </div>

            <Button
              size="sm"
              isIconOnly
              variant="light"
              color="danger"
              className="ml-2 opacity-0 group-hover/pair:opacity-100 transition-opacity"
              onPress={() => remove(pIndex)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="dashed"
        color="primary"
        className="w-full border-2 border-dashed h-10 font-medium text-primary/80 hover:text-primary hover:bg-primary/5 hover:border-primary"
        startContent={<Plus size={18} />}
        onPress={() => append({ left: "", right: "" })}
      >
        Add Pair
      </Button>
    </div>
  );
}
