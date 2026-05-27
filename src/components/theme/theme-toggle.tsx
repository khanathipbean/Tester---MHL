"use client";

import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

const themeOrder = ["light", "dark", "gradient"] as const;
const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  gradient: "Gradient",
};

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  const currentTheme = theme || "light";

  const cycleTheme = () => {
    const idx = themeOrder.indexOf(currentTheme as typeof themeOrder[number]);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    setTheme(next);
  };

  const icon = mounted ? (
    currentTheme === "dark" ? <Moon aria-hidden="true" className="h-4 w-4" /> :
      currentTheme === "gradient" ? <Sparkles aria-hidden="true" className="h-4 w-4" /> :
        <Sun aria-hidden="true" className="h-4 w-4" />
  ) : (
    <Sun aria-hidden="true" className="h-4 w-4" />
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${themeLabels[currentTheme] || "Light"}`}
      title={`Theme: ${themeLabels[currentTheme] || "Light"} — Click to switch`}
      onClick={cycleTheme}
    >
      {icon}
    </Button>
  );
}
