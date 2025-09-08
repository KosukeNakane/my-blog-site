"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "戻る" }: Props) {
  const router = useRouter();
  function onClick() {
    router.back();
  }
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
      type="button"
    >
      {label}
    </button>
  );
}

