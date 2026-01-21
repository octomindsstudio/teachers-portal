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
       {
        keys: ["F12"],
        handler(event, state) {
          event.preventDefault()
        },
       }
      ]}
    >
      {children}
    </Keybindy>
  );
}
