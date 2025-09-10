interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ 
  percentage, 
  size = 48, 
  strokeWidth = 3, 
  className = "" 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = "hsl(var(--success))";
  if (percentage < 75) strokeColor = "hsl(var(--warning))";
  if (percentage < 65) strokeColor = "hsl(var(--destructive))";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        className="progress-ring" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
