import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
