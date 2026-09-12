"use server";
import { createClientSession, createAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { client, ClientDoc } from "@/lib/sanity";

export interface ClientAuthState {
  error?: string;
  redirectUrl?: string;
}

export async function loginClient(
  targetSlug: string,
  prevState: ClientAuthState | null,
  formData: FormData
): Promise<ClientAuthState> {
  try {
    if (!formData || typeof formData.get !== "function") {
      return { error: "Invalid form submission." };
    }

    const password = (formData.get("password") as string)?.trim() || "";

    if (!password) {
      return { error: "Password is required." };
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword && password === adminPassword) {
      const clientQuery = `*[_type == "client" && slug.current == $targetSlug][0]`;
      const targetClient = await client.fetch<ClientDoc | null>(clientQuery, { targetSlug });

      if (targetClient?.slug?.current) {
        await createAdminSession();
        return { redirectUrl: `/${targetClient.slug.current}/dashboard` };
      } else {
        await createAdminSession();
        return { redirectUrl: "/admin/clients" };
      }
    } else {
      const clientQuery = `*[_type == "client" && slug.current == $targetSlug][0]`;
      const targetClient = await client.fetch<ClientDoc | null>(clientQuery, { targetSlug });

      if (!targetClient || !targetClient.slug?.current) {
        return { error: "Invalid password." };
      }

      if (targetClient.status === "paused") {
        return { error: "This account is currently paused. Please contact agency support." };
      }

      if (!targetClient.passwordHash) {
        return { error: "Authentication is not configured. Please contact agency support." };
      }

      const isMatch = await bcrypt.compare(password, targetClient.passwordHash);
      if (!isMatch) {
        return { error: "Invalid password." };
      }

      await createClientSession(targetClient.slug.current);
      return { redirectUrl: `/${targetClient.slug.current}/dashboard` };
    }
  } catch (err: unknown) {
    console.error("Client login error:", err);
    return { error: "An unexpected error occurred during sign in. Please try again." };
  }
}
