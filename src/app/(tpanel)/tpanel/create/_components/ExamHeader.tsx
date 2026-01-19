"use client";

import { Button } from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation"; // Correct router for app directory? No, user used custom hook.
// I should check the original file. Original uses `@/hooks/useRouter`. I will stick to that if possible, or standard `next/navigation`.
// The user used `import { useRouter } from "@/hooks/useRouter";`. I should use that or pass it as prop.
// Actually, `navigation` is safer for component purity if I can. But let's check `useRouter` hook usage.
// Assuming standard Next.js behavior for `back()`.

interface ExamHeaderProps {
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  questionCount: number;
  duration: number;
}

export function ExamHeader({
  onBack,
  onPublish,
  isPublishing,
  questionCount,
  duration,
}: ExamHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-default-200">
      <div className="p-2 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={onBack}
            className="text-default-500 hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">Create Exam</h1>
            <span className="text-xs text-default-400 mt-1">Draft Mode</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-default-400 hidden sm:inline-block mr-2">
            {questionCount} Questions • {duration} mins
          </span>
          <Button
            color="primary"
            variant="shadow"
            startContent={<Save size={18} />}
            onPress={onPublish}
            isLoading={isPublishing}
            className="font-medium px-6"
          >
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}
