type BadgeProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "mint" | "pink" | "blue" | "yellow" | "purple" | "gray";
};

const tones = {
  mint: "bg-emerald-100 text-emerald-700",
  pink: "bg-pink-100 text-pink-600",
  blue: "bg-blue-100/78 text-blue-600",
  yellow: "bg-amber-100 text-amber-700",
  purple: "bg-violet-100 text-violet-600",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({ children, icon, tone = "gray" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold",
        tones[tone],
      ].join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}
