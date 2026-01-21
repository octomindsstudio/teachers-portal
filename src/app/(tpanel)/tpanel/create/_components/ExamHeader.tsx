"use client";

import { Button } from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";

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
            startContent={isPublishing ? null : <Save size={18} />}
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
