"use client";

import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { Button, Input, Card, CardBody, Tooltip, Chip } from "@heroui/react";
import { Type, AlertCircle, Scissors } from "lucide-react";
import { FormValues } from "../../schema";
import { useState, useRef, useEffect } from "react";
import { cn } from "@heroui/react";

interface FillBlankEditorProps {
  index: number;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  isClueType?: boolean;
}

export function FillBlankEditor({
  index,
  register,
  control,
  setValue,
  isClueType = false,
}: FillBlankEditorProps) {
  // We sync with form state but manage local state for the interactive editor
  const currentText =
    useWatch({
      control,
      name: `questions.${index}.text` as any,
    }) || "";

  const currentClue = useWatch({
    control,
    name: `questions.${index}.clue` as any,
  });

  const [editorValue, setEditorValue] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (currentText && !initialized.current) {
      setEditorValue(currentText);
      initialized.current = true;
    }
  }, [currentText]);
  // Sync initial value if needed - usually empty for new question
  // But if editing, we might need to populate from form text?
  // Let's assume for now creation flow is main use case,
  // but we should check if currentText has content and editor is empty on mount.
  //   useEffect(() => {
  //       if (currentText && editorValue === "") {
  //           // BUT currentText has "______", we lost the answers.
  //           // We rely on 'answers' array to reconstruct? Complexity!
  //           // For Create page, usually starts empty.
  //       }
  //   }, []);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Ref for debouncing clue updates
  const clueSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track latest clue value for the debounce closure
  const currentClueRef = useRef(currentClue);

  useEffect(() => {
    currentClueRef.current = currentClue;
  }, [currentClue]);

  // Floating Menu State
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const handleSelect = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      // We have a selection
      // Calculate approximate position.
      // Textarea selection coords are tricky.
      // Simplest is to check mouse position? OR just show fixed relative to textarea?
      // Let's rely on onMouseUp to capture clientX/Y for positioning?
      // Or show a fixed "Actions" bar?
      // User requested "context menu appear THERE".
      // We can use a library or a hacky measurement.
      // Hack: Use onMouseUp to get event coordinates.
    } else {
      setMenuPosition(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    // Allow a small delay to let selection update
    setTimeout(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        // Show menu near mouse cursor
        // Offset slightly above cursor
        const rect = textarea.getBoundingClientRect();
        // We want it relative to the viewport or container?
        // Relative to container (CardBody) is safer if parent is relative.
        // Let's use Fixed or Absolute relative to viewport for simplicity if using Portal,
        // but here just absolute relative to the wrapper `div` which is relative.

        // We can use e.nativeEvent.offsetX / Y if we attach handler to textarea
        // But simpler: just use e.pageX/Y minus component offset?

        // Let's try to position it ABOVE the selection.
        // Since getting text coordinates in textarea is hard without a mirror,
        // using the mouse coordinates from the event is a good proxy.

        // We store selection range for the button action
        setSelectionRange({ start, end });
        setMenuPosition({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY - 40,
        });
      } else {
        setMenuPosition(null);
        setSelectionRange(null);
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+G or Cmd+G
    if ((e.ctrlKey || e.metaKey) && e.key === "g") {
      e.preventDefault();
      makeGap();
    }
  };

  const makeGap = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    // Use stored range if available (from mouse select), else current (from keyboard)
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    // Define text at the top scope
    const text = editorValue;

    // If triggered by button, using stored range might be safer if focus lost?
    // Actually button onMouseDown should preventDefault to avoid losing focus/selection?
    // Let's try using current selection first as it's most robust if focus is maintained.

    if (start === end && selectionRange) {
      start = selectionRange.start;
      end = selectionRange.end;
    }

    if (start === end) {
      // No selection: Insert empty gap [] and place cursor inside
      const newText = text.substring(0, start) + "[]" + text.substring(end);
      setEditorValue(newText);
      setMenuPosition(null);
      setSelectionRange(null);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);

      updateForm(newText);
      return;
    }

    const selection = text.substring(start, end);

    // Prevent nested brackets if already bracketed?
    // Simple check
    if (selection.includes("[") || selection.includes("]")) {
      // Maybe strip them? or ignore.
      // Let's just wrap.
    }

    // Improve clue auto-fill:
    if (isClueType && selection && !selection.includes("[")) {
      // We need to get the current clue value to append
      // Since we don't have getValues, we can use a useWatch for clue or just trust the registered value?
      // But we need to update it.
      // Let's use the local prop currentClue if we had one, but we didn't add it yet.
      // We can use a trick: setValue with shouldValidate?
      // Or better: Add currentClue useWatch at top level.
      // For this patch, I'll rely on a new useWatch added at top level.
    }

    const newText =
      text.substring(0, start) + `[${selection}]` + text.substring(end);

    setEditorValue(newText);
    setMenuPosition(null);
    setSelectionRange(null);

    // Restore focus and move caret
    setTimeout(() => {
      textarea.focus();
      // Position after the closing bracket
      const newPos = start + selection.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);

    updateForm(newText);
  };

  const updateForm = (val: string) => {
    const parsedText = val; // Keep the raw text with brackets [answer]

    // Extract answers for the answers array
    const regex = /\[(.*?)\]/g;
    let match;
    const answers: string[] = [];

    // We just want to extract answers, not replace text
    while ((match = regex.exec(val)) !== null) {
      answers.push(match[1]);
    }

    setValue(`questions.${index}.text` as any, parsedText);
    setValue(`questions.${index}.answers` as any, answers);

    // Auto-sync clue with answers (Debounced)
    if (isClueType) {
      if (clueSyncTimerRef.current) {
        clearTimeout(clueSyncTimerRef.current);
      }

      clueSyncTimerRef.current = setTimeout(() => {
        // Read latest currentClue from ref to avoid closure staleness
        const currentClueStr = currentClueRef.current || "";
        const existingTags = currentClueStr
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        const nonEmptyAnswers = answers.filter((a) => a && a.trim().length > 0);
        let updatedTags = [...existingTags];
        let hasChanges = false;

        nonEmptyAnswers.forEach((ans) => {
          if (!updatedTags.includes(ans)) {
            updatedTags.push(ans);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          setValue(`questions.${index}.clue` as any, updatedTags.join(","));
        }
      }, 800); // 800ms debounce
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditorValue(val);
    updateForm(val);
    setMenuPosition(null); // Hide menu on typing
  };

  const renderPreview = () => {
    if (!editorValue)
      return (
        <span className="text-default-400 italic">
          Preview will appear here...
        </span>
      );

    const parts = editorValue.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        // Student view: Show empty gap
        return (
          <span
            key={i}
            className="mx-1 inline-flex items-center justify-center min-w-20 h-6 border-b-2 border-dotted border-default-400 bg-default-50/50 rounded-sm translate-y-1"
          ></span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 relative">
      <Card className="bg-default-100 border-default-200 shadow-none overflow-visible">
        <CardBody className="p-2 overflow-visible relative">
          {/* Floating Menu */}
          {menuPosition && (
            <div
              className="absolute z-50 bg-black text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer animate-in fade-in zoom-in duration-200 transform -translate-x-1/2 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-t-black"
              style={{ left: menuPosition.x, top: menuPosition.y }}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus from textarea
                makeGap();
              }}
            >
              <Scissors size={14} />
              <span className="text-xs font-bold whitespace-nowrap">
                Make Gap
              </span>
              <span className="text-[10px] bg-white/20 px-1 rounded ml-1">
                Ctrl+G
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider flex items-center gap-1">
              <Type size={12} />
              Editor
            </span>
            <div className="text-[10px] text-default-400 bg-default-100 px-2 py-0.5 rounded">
              Highlight text or use <span className="font-bold">Ctrl+G</span>
            </div>
          </div>
          <textarea
            ref={textAreaRef}
            className="w-full bg-transparent border-none outline-none resize-none min-h-20 text-base font-medium p-2 focus:ring-0 leading-relaxed custom-scrollbar"
            placeholder="Type your sentence here..."
            value={editorValue}
            onChange={handleTextChange}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
          />
        </CardBody>
      </Card>

      {/* Preview Area */}
      <div className="p-4 border border-default-200 rounded-xl bg-white/50">
        <div className="text-xs font-semibold text-default-400 mb-2 uppercase">
          Student View
        </div>
        <div className="text-lg leading-relaxed text-default-700 font-serif">
          {renderPreview()}
        </div>
      </div>

      {isClueType && (
        <div className="space-y-1.5">
          <span className="text-xs text-default-500 font-medium ml-1">
            Clues / Word Bank
          </span>
          <div className="min-h-10.5 p-1.5 rounded-xl border-2 border-default-200 bg-white shadow-sm flex flex-wrap gap-1.5 items-center focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Parse current clue string into tags. We use the watched currentClue */}
            {currentClue
              ? currentClue.split(",").map((tag: string, i: number) => {
                  const cleanTag = tag.trim();
                  if (!cleanTag) return null;
                  return (
                    <Chip
                      key={i}
                      onClose={() => {
                        const newTags = currentClue
                          .split(",")
                          .filter((_: string, idx: number) => idx !== i)
                          .join(",");
                        setValue(`questions.${index}.clue` as any, newTags);
                      }}
                      variant="flat"
                      color="secondary"
                      size="sm"
                      classNames={{ base: "h-7" }}
                    >
                      {cleanTag}
                    </Chip>
                  );
                })
              : null}

            <input
              className="flex-1 min-w-30 bg-transparent outline-none text-sm px-1 placeholder:text-default-400"
              placeholder={
                !currentClue ? "Type a clue and press Enter..." : "Add more..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === ",") {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    // Add to existing
                    const existing = currentClue
                      ? currentClue.split(",").map((s: string) => s.trim())
                      : [];
                    if (!existing.includes(val)) {
                      const newClueStr =
                        existing.length > 0 ? `${currentClue},${val}` : val;
                      setValue(`questions.${index}.clue` as any, newClueStr);
                    }
                  }
                  e.currentTarget.value = "";
                } else if (
                  e.key === "Backspace" &&
                  e.currentTarget.value === ""
                ) {
                  // Remove last tag
                  const existing = currentClue
                    ? currentClue.split(",").map((s: string) => s.trim())
                    : [];
                  if (existing.length > 0) {
                    existing.pop();
                    setValue(
                      `questions.${index}.clue` as any,
                      existing.join(","),
                    );
                  }
                }
              }}
            />
          </div>
          <p className="text-[10px] text-default-400 ml-1">
            Tags are auto-generated from gaps, but you can add custom ones.
          </p>
        </div>
      )}
    </div>
  );
}
