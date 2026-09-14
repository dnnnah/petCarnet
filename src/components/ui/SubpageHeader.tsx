type SubpageHeaderProps = {
  eyebrow: string;
  eyebrowTone: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  background: string;
};

export function SubpageHeader({
  eyebrow,
  eyebrowTone,
  title,
  description,
  icon,
  background,
}: SubpageHeaderProps) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2.25rem] p-6 shadow-[0_16px_38px_rgba(16,185,129,0.09)] ring-1 sm:p-8",
        background,
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-[2.25rem] bg-gray-900 ring-1 ring-gray-800 dark:block hidden"
      />
      <div className="absolute -right-4 -top-6 text-gray-100 dark:text-gray-800">{icon}</div>
      <div className="relative">
        <p className={["text-sm font-extrabold uppercase tracking-[0.18em]", eyebrowTone].join(" ")}>
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </section>
  );
}
