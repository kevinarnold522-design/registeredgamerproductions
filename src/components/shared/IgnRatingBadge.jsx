import React from "react";

// Modern score badge for IGN ratings (out of 10).
export default function IgnRatingBadge({ rating, size = "md" }) {
  if (rating === undefined || rating === null || rating === "") return null;
  const num = Number(rating);
  if (isNaN(num)) return null;

  const color = num >= 8 ? "#22c55e" : num >= 6 ? "#eab308" : "#ef4444";
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg font-black ${sizes[size]}`}
      style={{ background: `${color}22`, border: `1px solid ${color}66`, color }}
      title={`IGN Score ${num} / 10`}
    >
      IGN <span>{num} / 10</span>
    </span>
  );
}