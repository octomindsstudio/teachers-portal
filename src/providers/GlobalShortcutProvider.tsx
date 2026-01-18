"use client";

import { Keybindy } from "@keybindy/react";
import { useTheme } from "next-themes";

export function GlobalShortcutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <Keybindy
      shortcuts={[
        {
          keys: ["F2"],
          handler: () => {
            console.log(theme);
            setTheme(theme === "dark" ? "light" : "dark");
          },
          options: {
            preventDefault: true,
          },
        },
      ]}
    >
      {children}
    </Keybindy>
  );
}
