import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function Button({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-300",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
