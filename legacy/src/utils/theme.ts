import { isDark } from "@/utils/is";

export type ThemeMode = "light" | "dark" | "system";

export const resolveTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "system") return isDark() ? "dark" : "light";
  return mode;
};

export const applyTheme = (mode: ThemeMode): void => {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
};
