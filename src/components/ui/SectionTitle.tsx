type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  icon?: React.ReactNode;
};

export function SectionTitle({ eyebrow, title, icon }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-gray-950">
          {icon}
          {title}
        </h2>
      </div>
    </div>
  );
}
