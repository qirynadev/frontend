export function formatAmount(amount: number | string) {
  if (!amount) return "N/A";
  else {
    const formatAmount = typeof amount == "string" ? parseInt(amount) : amount;
    const d = new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "XOF",
      useGrouping: true,
    });
    return d.format(formatAmount);
  }
}

/**
 * Formats a number using the Intl.NumberFormat API.
 *
 * @param amount - The number to format. Defaults to 0.
 * @param style - The formatting style. Defaults to "decimal".
 * @param lang - The language tag. Defaults to "de-DE".
 *
 * @returns The formatted number.
 */
export function formatNumber(
  amount: number | string = 0,
  style: "decimal" | "currency" | "percent" = "decimal",
  lang: string = "de-DE",
): string {
  const formatAmount: number = typeof amount == "string" ? parseInt(amount) : amount;
  const d: Intl.NumberFormat = new Intl.NumberFormat(lang, { style });
  return d.format(formatAmount);
}

export const formatPhoneNumberOnly = (value: string): string => {
  return value.replace(/\D/g, "");
};
export const authoriseCaractere = (value: string): string => {
  return value.replace(/^[\w \-]+$/, "");
};
