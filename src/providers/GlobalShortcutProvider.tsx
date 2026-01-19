"use client";

import { Keybindy } from "@keybindy/react";

export function GlobalShortcutProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Keybindy
      shortcuts={[
       
      ]}
    >
      {children}
    </Keybindy>
  );
}
