"use server";
import { createAdminSession } from "@/lib/auth";

export interface AuthState {
  error?: string;
  redirectUrl?: string;
}

export async function loginAdmin(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  try {
    const password = formData.get("password") as string;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return { error: "Admin authentication is not configured on this server." };
    }

    if (password === adminPassword) {
      await createAdminSession();
      return { redirectUrl: "/admin/clients" };
    } else {
      return { error: "Invalid admin password." };
    }
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return { error: "An unexpected error occurred during sign in." };
  }
}
