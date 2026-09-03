import type { FormulaType } from "@/constants/constant.type";

export type AccentStyle = {
  titleColor: string;
  priceColor: string;
  buttonBg: string;
  badgeBg: string;
  badgeText: string;
};

// Palette d'accent fixe (back-office : Formula.accent) — évite de laisser une couleur
// hexadécimale libre. Partagée entre les écrans "Offres de Logement" et "Choisissez
// votre formule" (les deux montrent des cartes de formules Formula colorées).
export const ACCENT_STYLES: Record<string, AccentStyle> = {
  green: { titleColor: "#00a31c", priceColor: "#10b141", buttonBg: "#08b534", badgeBg: "#edf8eb", badgeText: "#04aa1b" },
  purple: { titleColor: "#570bfd", priceColor: "#6117fe", buttonBg: "#5c13fe", badgeBg: "#eef2ff", badgeText: "#5c3cf3" },
  orange: { titleColor: "#ff6300", priceColor: "#fe6801", buttonBg: "#fe6903", badgeBg: "#fff7ed", badgeText: "#ea580c" },
  blue: { titleColor: "#003ef3", priceColor: "#1d4ed8", buttonBg: "#2563eb", badgeBg: "#eaf1fd", badgeText: "#1d4ed8" },
  red: { titleColor: "#f6071a", priceColor: "#f6071a", buttonBg: "#f6071a", badgeBg: "#fee2e2", badgeText: "#dc2626" },
};

/**
 * Résout le style d'accent d'une formule : `formula.accent` s'il est défini, sinon un
 * repli positionnel (ordre propre à chaque écran, pour ne pas casser le rendu des
 * formules pas encore migrées côté back-office).
 */
export function accentFor(formula: FormulaType, index: number, fallbackOrder: string[]): AccentStyle {
  return ACCENT_STYLES[formula.accent ?? ""] ?? ACCENT_STYLES[fallbackOrder[index % fallbackOrder.length]];
}
