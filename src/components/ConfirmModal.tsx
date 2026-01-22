"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="blur"
      className="bg-white rounded-4xl overflow-hidden shadow-2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex flex-col items-center text-center p-8 gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDanger
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-charcoal mb-2">
                  {title}
                </h3>
                <p className="text-sm font-medium text-charcoal/50 leading-relaxed">
                  {description}
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex gap-3 justify-center pb-8 px-8 border-t-0">
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={isLoading}
                className="font-bold text-charcoal/60 hover:text-charcoal"
                radius="lg"
              >
                Cancel
              </Button>
              <Button
                color={isDanger ? "danger" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
                className={`font-bold text-white shadow-lg ${
                  isDanger ? "shadow-red-500/20" : "shadow-orange-500/20"
                }`}
                radius="lg"
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
