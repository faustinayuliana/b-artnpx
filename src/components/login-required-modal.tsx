"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { Button } from "./button";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  return (
    <Modal
      open={open}
      title="Login Required"
      description="Please sign in first to access this feature."
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 mt-4">
        <Button
          className="w-full bg-zinc-900 hover:bg-zinc-800"
          onClick={() => {
            onClose();
            router.push("/login");
          }}
        >
          Login
        </Button>
        <button
          type="button"
          className="w-full py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition underline-offset-2 hover:underline"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
