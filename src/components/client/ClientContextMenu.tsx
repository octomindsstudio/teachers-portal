"use client";
import * as ContextMenu from "@radix-ui/react-context-menu";

export const ClientContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="block h-full w-full">
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        {null}
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
