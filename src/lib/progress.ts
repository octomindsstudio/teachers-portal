"use client";
import { useEffect, useId } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "../components/nprogress";

NProgress.configure({ showSpinner: false });
NProgress.setColor("var(--primary)");
export function Progress() {
  const pathname = usePathname();
  const renderId = useId();
  const searchParams = useSearchParams();
  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.remove();
    };
  }, [pathname, searchParams, renderId]);
  return null;
}
