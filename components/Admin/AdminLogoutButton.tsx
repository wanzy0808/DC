"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <Button type="button" variant="outline" size="lg" onClick={logout}>
      Keluar
    </Button>
  );
}
