type BadgeProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "mint" | "pink" | "blue" | "yellow" | "purple" | "gray";
};

const tones = {
  mint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
  blue: "bg-blue-100/78 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  yellow: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  purple: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
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
