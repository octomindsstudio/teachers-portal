"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSidebarResize() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= 200 && newWidth <= 480) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [setSidebarWidth],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return { sidebarRef, startResizing, sidebarWidth };
}
