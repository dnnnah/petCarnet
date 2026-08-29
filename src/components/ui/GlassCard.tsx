type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function GlassCard({ children, className = "", id }: GlassCardProps) {
  return (
    <div
      id={id}
      className={[
        "soft-card rounded-[2rem] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
