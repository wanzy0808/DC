"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-xl bg-[#7A1C25] px-5 py-3 text-sm font-medium text-white"
    >
      Keluar
    </button>
  );
}