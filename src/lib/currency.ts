const fallbackCurrencies = ["IDR", "USD", "SGD", "MYR", "AUD", "EUR", "GBP", "JPY", "CNY", "KRW"];

function supportedCurrencyCodes() {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: "currency") => string[];
  };
  return intl.supportedValuesOf?.("currency") ?? fallbackCurrencies;
}

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

export const currencyOptions = supportedCurrencyCodes().map((code) => ({
  value: code,
  label: `${code} — ${currencyNames.of(code) ?? code}`,
}));

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "IDR",
  compact = false,
) {
  if (value === null || value === undefined || value === "") return "Not stated";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not stated";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      ...(compact ? { notation: "compact" as const } : {}),
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en")}`;
  }
}

export function formatCurrencyRange(
  minimum: number | null | undefined,
  maximum: number | null | undefined,
  currency = "IDR",
  compact = false,
) {
  if (minimum == null && maximum == null) return "Salary not disclosed";
  if (minimum == null) return `Up to ${formatCurrency(maximum, currency, compact)}`;
  if (maximum == null) return `From ${formatCurrency(minimum, currency, compact)}`;
  return `${formatCurrency(minimum, currency, compact)}–${formatCurrency(maximum, currency, compact)}`;
}
