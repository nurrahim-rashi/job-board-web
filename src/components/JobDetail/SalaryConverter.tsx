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

  // Quote the rate in whichever direction reads as a number rather than a
  // string of zeroes: "1 USD = 17,767.8 IDR", not "1 IDR = 0.0000562814 USD".
  const formatRate = (value: number) =>
    new Intl.NumberFormat("en", { maximumSignificantDigits: 6 }).format(value);
  const rateLine =
    rate === null
      ? null
      : rate >= 1
        ? `1 ${base} = ${formatRate(rate)} ${target}`
        : `1 ${target} = ${formatRate(1 / rate)} ${base}`;

  const listed = formatCurrencyRange(salaryMin, salaryMax, base, false, "code");

  const convertedPane = loading ? (
    <p className="salary-converter-state">Loading today's rates…</p>
  ) : error ? (
    <p className="salary-converter-state is-error">{error}</p>
  ) : target === base ? (
    <p className="salary-converter-state">
      Already listed in {base}. Pick another currency above.
    </p>
  ) : rate === null ? (
    <p className="salary-converter-state is-error">
      No published rate for {target} yet.
    </p>
  ) : (
    <>
      <b className="salary-converter-amount">{converted}</b>
      <span className="salary-converter-period">per month</span>
    </>
  );

  return (
    <section className="salary-converter">
      <p className="eyebrow">Convert this salary</p>

      <div className="salary-converter-panes">
        <div className="salary-converter-pane">
          <small className="salary-converter-pane-label">Listed salary</small>
          <b className="salary-converter-amount">{listed}</b>
          <span className="salary-converter-period">per month</span>
        </div>

        <div className="salary-converter-pane is-target">
          <div className="salary-converter-pane-head">
            <small className="salary-converter-pane-label">Converted to</small>
            <CurrencySelect
              value={target}
              onChange={chooseTarget}
              ariaLabel="Convert salary to currency"
            />
          </div>
          {convertedPane}
        </div>
      </div>

      {rate !== null && target !== base && !loading && !error && (
        <small className="salary-converter-note">
          {rateLine}
          {table?.fetchedAt
            ? ` · rate from ${new Date(table.fetchedAt).toLocaleDateString(
                "en-GB",
                { dateStyle: "medium" },
              )}`
            : ""}
        </small>
      )}
      <small className="salary-converter-note">
        Converted at today's mid-market rate. Treat it as a guide, not an offer:
        the amount you are paid depends on the company's own rate and any
        transfer fees.
      </small>
    </section>
  );
}
