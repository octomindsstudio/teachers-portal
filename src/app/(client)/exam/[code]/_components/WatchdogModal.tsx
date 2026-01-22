"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  CircularProgress,
} from "@heroui/react";
import { ShieldAlert } from "lucide-react";

interface WatchdogModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  violation: string | null;
  strikes: number;
  maxStrikes: number;
  secondsLeft?: number;
}

export const WatchdogModal: React.FC<WatchdogModalProps> = ({
  isOpen,
  onOpenChange,
  violation,
  strikes,
  maxStrikes,
  secondsLeft,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "bg-danger-50 border-2 border-danger-200 shadow-2xl",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-danger-600">
              <ShieldAlert size={48} />
              <h2 className="text-2xl font-black uppercase tracking-wider">
                Violation Detected
              </h2>
            </ModalHeader>
            <ModalBody className="text-center flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <CircularProgress
                  size="lg"
                  value={secondsLeft ? (secondsLeft / 10) * 100 : 0}
                  color="danger"
                  showValueLabel={false}
                  classNames={{
                    svg: "w-32 h-32 drop-shadow-md",
                    indicator: "stroke-danger-600",
                    track: "stroke-danger-100",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-black text-danger-600">
                    {secondsLeft}s
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-bold text-default-800">
                  {violation}
                </p>
                <p className="text-default-500">
                  This action has been recorded. You have
                  <span className="font-black text-danger text-xl mx-1">
                    {maxStrikes - strikes}
                  </span>
                  attempts remaining before automatic disqualification.
                </p>
                <p className="text-small font-semibold text-danger-500 animate-pulse">
                  Click "I Understand" immediately or exam will terminate.
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="justify-center">
              <Button
                color="danger"
                onPress={() => {
                  // Re-request fullscreen if lost
                  if (!document.fullscreenElement)
                    document.documentElement
                      .requestFullscreen()
                      .catch(() => {});
                  onClose();
                }}
                className="font-bold w-full"
                size="lg"
              >
                I Understand & Return to Exam
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
