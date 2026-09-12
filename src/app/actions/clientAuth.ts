"use server";

import { client, ClientDoc } from "@/lib/sanity";
import { createClientSession, createAdminSession } from "@/lib/auth";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export interface ClientAuthState {
  error?: string;
}

export async function loginClient(
  slug: string,
  prevState: ClientAuthState | null,
  formData: FormData
): Promise<ClientAuthState> {
  if (!formData || typeof formData.get !== "function") {
    return { error: "Invalid form submission." };
  }

  const password = formData.get("password") as string;
  if (!password) {
    return { error: "Password is required" };
  }

  // 1. Check if entered password is the Admin Master Key
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && password === adminPassword) {
    const adminQuery = `*[_type == "client" && slug.current == $slug][0]`;
    const targetClient = await client.fetch<ClientDoc | null>(adminQuery, { slug });
    if (targetClient) {
      await createAdminSession();
      redirect(`/${slug}/dashboard`);
    }
  }

  // 2. Standard Client Authentication
  const query = `*[_type == "client" && slug.current == $slug][0]`;
  const clientData = await client.fetch<ClientDoc | null>(query, { slug });

  if (!clientData) {
    return { error: "Invalid password." }; // Generic error, never reveal slug exists
  }

  if (clientData.status === "paused") {
    return { error: "Invalid password." }; // Treat paused exactly like wrong password
  }

  const isMatch = await bcrypt.compare(password, clientData.passwordHash);
  
  if (!isMatch) {
    return { error: "Invalid password." };
  }

  // Success
  await createClientSession(clientData.slug.current);
  redirect(`/${slug}/dashboard`);
}
