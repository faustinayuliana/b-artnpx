interface SectionHeadingProps {
  title: string;
  description?: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-1.5 w-12 rounded-full bg-black" />
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      </div>
      {description ? <p className="max-w-2xl text-xl font-semibold text-zinc-900">{description}</p> : null}
    </div>
  );
}
