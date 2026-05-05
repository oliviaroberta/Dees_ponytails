import { useCurrency } from "@/context/CurrencyContext";

const CurrencySelect = () => {
  const { currency, setCurrency, currencyOptions } = useCurrency();

  return (
    <div>
      <p className="mb-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Currency
      </p>
      <div className="relative">
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value as typeof currency)}
          className="min-w-40 rounded border border-border bg-background/80 px-3 py-2 font-body text-sm text-foreground outline-none transition-colors hover:border-foreground focus:border-foreground"
          aria-label="Select currency"
        >
          {currencyOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} - {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 font-body text-[11px] text-muted-foreground">
        Display conversion uses fixed demo rates.
      </p>
    </div>
  );
};

export default CurrencySelect;
