"use client";

type ChoiceGroupProps = {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Highlight a specific answer as a "watch out" choice (e.g. power lines). */
  flagOption?: string;
};

/**
 * Large, tappable single-select control. Built for phone use and for older
 * homeowners — big targets, clear selected state, no tiny native radios.
 */
export function ChoiceGroup({
  name,
  options,
  value,
  onChange,
  flagOption,
}: ChoiceGroupProps) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = value === option;
        const isFlag = flagOption === option && isSelected;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option)}
            className={[
              "min-h-12 rounded-[--radius-card] border px-4 py-2.5 text-base font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
              isSelected
                ? isFlag
                  ? "border-amber-deep bg-amber-deep text-white shadow-sm"
                  : "border-forest bg-forest text-white shadow-sm"
                : "border-line bg-paper text-ink hover:border-forest/50 hover:bg-cream-deep",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
