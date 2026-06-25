import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Badge({ children, variant = "primary" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        variant === "primary" ? "bg-black text-white" : "bg-zinc-200 text-zinc-800",
      )}
    >
      {children}
    </span>
  );
}
