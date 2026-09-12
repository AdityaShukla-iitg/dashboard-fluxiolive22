"use server";

import { client, ClientDoc } from "@/lib/sanity";
import { createClientSession, createAdminSession } from "@/lib/auth";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export interface RootAuthState {
  error?: string;
}

export async function loginRoot(
  prevState: RootAuthState | null,
  formData: FormData
): Promise<RootAuthState> {
  if (!formData || typeof formData.get !== "function") {
    return { error: "Invalid form submission." };
  }

  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required." };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no slug is provided, check if it is the admin logging in
  if (!slug) {
    if (adminPassword && password === adminPassword) {
      await createAdminSession();
      redirect("/admin/clients");
    }
    return { error: "Brand identifier is required." };
  }

  // If slug is provided and matches admin password (Master Key)
  if (adminPassword && password === adminPassword) {
    const query = `*[_type == "client" && slug.current == $slug][0]`;
    const targetClient = await client.fetch<ClientDoc | null>(query, { slug });
    if (targetClient) {
      await createAdminSession();
      redirect(`/${slug}/dashboard`);
    }
  }

  // Standard client credentials verification
  const query = `*[_type == "client" && slug.current == $slug][0]`;
  const clientData = await client.fetch<ClientDoc | null>(query, { slug });

  if (!clientData || clientData.status === "paused") {
    return { error: "Invalid brand identifier or password." };
  }

  const isMatch = await bcrypt.compare(password, clientData.passwordHash);
  if (!isMatch) {
    return { error: "Invalid brand identifier or password." };
  }

  await createClientSession(clientData.slug.current);
  redirect(`/${slug}/dashboard`);
}
