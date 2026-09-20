import { useEffect, useMemo, useState } from "react";
import { CurrencySelect } from "../site/CurrencySelect";
import { formatCurrencyRange } from "../../lib/currency";
import {
  getExchangeRates,
  type ExchangeRateTable,
} from "../../services/region.service";

type Props = {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
};

const preferredTarget = (base: string) => {
  const stored = localStorage.getItem("polaris-salary-currency");
  if (stored && stored !== base) return stored;
  return base === "USD" ? "IDR" : "USD";
};

export function SalaryConverter({ salaryMin, salaryMax, salaryCurrency }: Props) {
  const base = (salaryCurrency || "IDR").toUpperCase();
  const [target, setTarget] = useState(() => {
    try {
      return preferredTarget(base);
    } catch {
      return base === "USD" ? "IDR" : "USD";
    }
  });
  const [table, setTable] = useState<ExchangeRateTable | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getExchangeRates(base)
      .then((rates) => active && setTable(rates))
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Exchange rates are unavailable right now.",
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [base]);

  const rate = table?.rates?.[target] ?? null;

  const converted = useMemo(() => {
    if (rate === null) return null;
    const scale = (value: number | null) =>
      value === null ? null : Math.round(value * rate);
    return formatCurrencyRange(scale(salaryMin), scale(salaryMax), target, false, "code");
  }, [rate, salaryMax, salaryMin, target]);

  const chooseTarget = (currency: string) => {
    setTarget(currency);
    try {
      localStorage.setItem("polaris-salary-currency", currency);
    } catch {
      // A blocked storage quota should never break the converter.
    }
  };

  const rateLine =
    rate === null
      ? null
      : `1 ${base} = ${new Intl.NumberFormat("en", {
          maximumSignificantDigits: 6,
        }).format(rate)} ${target}`;

  return (
    <section className="salary-converter">
      <div className="salary-converter-head">
        <p className="eyebrow">Convert this salary</p>
        <CurrencySelect
          value={target}
          onChange={chooseTarget}
          ariaLabel="Convert salary to currency"
        />
      </div>

      {loading ? (
        <p className="salary-converter-state">Loading today's rates…</p>
      ) : error ? (
        <p className="salary-converter-state is-error">{error}</p>
      ) : target === base ? (
        <p className="salary-converter-state">
          This role is already listed in {base}. Pick another currency to
          convert it.
        </p>
      ) : rate === null ? (
        <p className="salary-converter-state is-error">
          No published rate for {target} yet. Try another currency.
        </p>
      ) : (
        <>
          <b className="salary-converter-amount">{converted} / month</b>
          <small className="salary-converter-note">
            {rateLine}
            {table?.fetchedAt
              ? ` · rate from ${new Date(table.fetchedAt).toLocaleDateString(
                  "en-GB",
                  { dateStyle: "medium" },
                )}`
              : ""}
          </small>
          <small className="salary-converter-note">
            Converted at today's mid-market rate. Treat it as a guide, not an
            offer: the amount you are paid depends on the company's own rate and
            any transfer fees.
          </small>
        </>
      )}
    </section>
  );
}
