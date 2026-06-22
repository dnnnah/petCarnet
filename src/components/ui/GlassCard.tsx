type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={[
        "soft-card rounded-[2rem] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
