import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@heroui/react";

interface UseAntiCheatProps {
  stage: "welcome" | "active" | "submitted" | "booted";
  maxStrikes: number;
  onBoot: () => void;
  isAutoSubmitting: React.MutableRefObject<boolean>;
}

export const useAntiCheat = ({
  stage,
  maxStrikes,
  onBoot,
  isAutoSubmitting,
}: UseAntiCheatProps) => {
  const [strikes, setStrikes] = useState(0);
  const [violation, setViolation] = useState<string | null>(null);
  const [violationSeconds, setViolationSeconds] = useState(10);
  const warningModal = useDisclosure();

  // Timeout for "away" auto-boot
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Timestamp for accurate "away" duration calculation
  const awayStartTimeRef = useRef<number | null>(null);
  // Timeout for Modal Acknowledgment
  const violationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recordStrike = (reason: string) => {
    if (isAutoSubmitting.current) return;

    setViolation(reason);

    setStrikes((prev) => {
      const newStrikes = prev + 1;
      if (newStrikes >= maxStrikes) {
        warningModal.onClose();
        onBoot();
      } else {
        warningModal.onOpen();

        // Start 10s Violation Timeout logic if not already running
        if (!violationTimeoutRef.current) {
          setViolationSeconds(10);

          violationTimeoutRef.current = setInterval(() => {
            setViolationSeconds((prevSec) => {
              if (prevSec <= 1) {
                if (violationTimeoutRef.current) {
                  clearInterval(violationTimeoutRef.current);
                }
                onBoot();
                warningModal.onClose();
                return 0;
              }
              return prevSec - 1;
            });
          }, 1000);
        }
      }
      return newStrikes;
    });
  };

  useEffect(() => {
    if (stage !== "active") return;

    const handleAwayStart = (reason: string) => {
      // Record strike immediately
      recordStrike(reason);

      // Save start time if not already away
      if (!awayTimeoutRef.current) {
        awayTimeoutRef.current = setTimeout(() => {
          warningModal.onClose();
          onBoot();
        }, 10000);
      }

      if (!awayStartTimeRef.current) {
        awayStartTimeRef.current = Date.now();
      }
    };

    const handleBack = () => {
      if (awayStartTimeRef.current) {
        const diff = Date.now() - awayStartTimeRef.current;
        if (diff > 10000) {
          onBoot();
          warningModal.onClose();
        }
        awayStartTimeRef.current = null;
      }

      if (awayTimeoutRef.current) {
        clearTimeout(awayTimeoutRef.current);
        awayTimeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAwayStart("Tab switching detected.");
      } else {
        handleBack();
      }
    };

    const handleBlur = () => {
      handleAwayStart("Window focus lost.");
    };

    const handleFocus = () => {
      handleBack();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordStrike("Exited Fullscreen mode.");
      }
    };

    const handlePageHide = () => {
      handleAwayStart("Page hidden (Mobile/Tab switch).");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (awayTimeoutRef.current) clearTimeout(awayTimeoutRef.current);
      if (violationTimeoutRef.current)
        clearInterval(violationTimeoutRef.current);
    };
  }, [stage, maxStrikes, onBoot]); // Dependencies

  return {
    strikes,
    violation,
    violationSeconds,
    warningModal,
    violationTimeoutRef, // Exporting ref in case we need to clear it manually from outside (though likely handled internally)
    setStrikes,
  };
};
