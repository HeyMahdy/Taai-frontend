export function Logo({ className = "", size = "default" }: { className?: string; size?: "default" | "sm" | "lg" }) {
  const dimensions = {
    sm: { width: 72, height: 28 },
    default: { width: 90, height: 34 },
    lg: { width: 110, height: 42 },
  };
  const { width, height } = dimensions[size];

  return (
    <svg
      viewBox="0 0 120 44"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TAAI"
    >
      {/* T - geometric with rounded terminals */}
      <path
        d="M2 6h22M13 6v28"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* A - circular/geometric style */}
      <path
        d="M32 34V16c0-6.627 5.373-12 12-12s12 5.373 12 12v18"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 24h24"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* A - second A, same style */}
      <path
        d="M62 34V16c0-6.627 5.373-12 12-12s12 5.373 12 12v18"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 24h24"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* I - with dot accent like Logoza style */}
      <path
        d="M98 14v20"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Decorative dot on I - in primary/accent color */}
      <circle cx="98" cy="5" r="4" className="fill-primary" />
    </svg>
  );
}
