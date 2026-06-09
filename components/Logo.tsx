type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 3.5c-3.6 0-6.5 2.7-6.5 6 0 1 .2 1.9.7 2.7-1.8.7-3.1 2.4-3.1 4.4 0 2.6 2.2 4.7 4.9 4.7h2.1V28h3.8v-6.7h2.1c2.7 0 4.9-2.1 4.9-4.7 0-2-1.3-3.7-3.1-4.4.5-.8.7-1.7.7-2.7 0-3.3-2.9-6-6.4-6Z"
          fill="var(--forest)"
        />
        <path
          d="M16 12.5v9"
          stroke="var(--cream)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-forest-deep">
          LimbList
        </span>
      )}
    </span>
  );
}
