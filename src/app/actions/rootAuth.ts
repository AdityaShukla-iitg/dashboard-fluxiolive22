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

  const rawIdentifier = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const normalizedSlug = rawIdentifier.replace(/[\s-_]+/g, "");
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required." };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Direct Agency Admin sign in when entering "fluxio live", "admin", or leaving blank with admin password
  const isAdminIdentifier = 
    !rawIdentifier || 
    normalizedSlug === "fluxiolive" || 
    normalizedSlug === "fluxio" || 
    normalizedSlug === "admin";

  if (adminPassword && password === adminPassword && isAdminIdentifier) {
    await createAdminSession();
    redirect("/admin/clients");
  }

  // Master key preview for a specific client slug using admin password
  if (adminPassword && password === adminPassword && rawIdentifier) {
    const slug = rawIdentifier.replace(/\s+/g, "-");
    const query = `*[_type == "client" && slug.current == $slug][0]`;
    const targetClient = await client.fetch<ClientDoc | null>(query, { slug });
    if (targetClient) {
      await createAdminSession();
      redirect(`/${slug}/dashboard`);
    }
  }

  // Standard client credentials verification
  const slug = rawIdentifier.replace(/\s+/g, "-");
  if (!slug) {
    return { error: "Brand identifier is required." };
  }

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
