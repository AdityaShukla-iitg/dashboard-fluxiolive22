"use server";

import { createAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
}

export async function loginAdmin(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  let destinationUrl = "";

  try {
    if (!formData || typeof formData.get !== "function") {
      return { error: "Invalid form submission." };
    }

    const password = (formData.get("password") as string)?.trim() || "";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!password || !adminPassword) {
      return { error: "Authentication configuration error." };
    }

    if (password === adminPassword) {
      await createAdminSession();
      destinationUrl = "/admin/clients";
    } else {
      return { error: "Invalid admin password." };
    }
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return { error: "An unexpected error occurred during sign in." };
  }

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  return {};
}
