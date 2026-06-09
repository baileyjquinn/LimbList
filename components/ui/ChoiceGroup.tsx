"use client";

type BaseProps = {
  name: string;
  options: readonly string[];
  /** Highlight a specific answer as a "watch out" choice (e.g. power lines). */
  flagOption?: string;
};

type SingleProps = BaseProps & {
  multi?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiProps = BaseProps & {
  multi: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type ChoiceGroupProps = SingleProps | MultiProps;

/**
 * Large, tappable choice control. Built for phone use and for older homeowners
 * — big targets, clear selected state, no tiny native radios/checkboxes.
 * Pass `multi` to allow multiple selections.
 */
export function ChoiceGroup(props: ChoiceGroupProps) {
  const { name, options, flagOption } = props;

  return (
    <div
      role={props.multi ? "group" : "radiogroup"}
      className="flex flex-wrap gap-2.5"
    >
      {options.map((option) => {
        const isSelected = props.multi
          ? props.value.includes(option)
          : props.value === option;
        const isFlag = flagOption === option && isSelected;

        return (
          <button
            key={option}
            type="button"
            role={props.multi ? "checkbox" : "radio"}
            aria-checked={isSelected}
            onClick={() => {
              if (props.multi) {
                const next = isSelected
                  ? props.value.filter((v) => v !== option)
                  : [...props.value, option];
                props.onChange(next);
              } else {
                props.onChange(option);
              }
            }}
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
      {props.multi ? (
        <input type="hidden" name={name} value={props.value.join(", ")} />
      ) : (
        <input type="hidden" name={name} value={props.value} />
      )}
    </div>
  );
}
