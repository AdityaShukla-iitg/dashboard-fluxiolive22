"use server";

import { createAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
}

export async function loginAdmin(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  if (!formData || typeof formData.get !== "function") {
    return { error: "Invalid form submission." };
  }

  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password || !adminPassword) {
    return { error: "Authentication configuration error." };
  }

  if (password === adminPassword) {
    await createAdminSession();
    redirect("/admin/clients");
  }

  return { error: "Invalid admin password." };
}
