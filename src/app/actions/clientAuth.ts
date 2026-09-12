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

  const password = (formData.get("password") as string)?.trim() || "";
  if (!password) {
    return { error: "Password is required" };
  }

  const cleanSlug = slug.trim();
  const lowerSlug = cleanSlug.toLowerCase();
  const compactSlug = lowerSlug.replace(/[\s-_]+/g, "");
  const hyphenSlug = lowerSlug.replace(/[\s_]+/g, "-");

  const clientQuery = `*[_type == "client" && (
    slug.current == $cleanSlug ||
    lower(slug.current) == $lowerSlug ||
    lower(slug.current) == $hyphenSlug ||
    lower(slug.current) == $compactSlug ||
    lower(name) == $lowerSlug
  )][0]`;

  const targetClient = await client.fetch<ClientDoc | null>(clientQuery, {
    cleanSlug,
    lowerSlug,
    hyphenSlug,
    compactSlug,
  });

  // 1. Check if entered password is the Admin Master Key
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && password === adminPassword) {
    await createAdminSession();
    if (targetClient?.slug?.current) {
      redirect(`/${targetClient.slug.current}/dashboard`);
    } else {
      redirect("/admin/clients");
    }
  }

  // 2. Standard Client Authentication
  if (!targetClient) {
    return { error: "Invalid password." };
  }

  if (targetClient.status === "paused") {
    return { error: "This brand account is currently paused. Please contact agency support." };
  }

  const isMatch = await bcrypt.compare(password, targetClient.passwordHash);
  if (!isMatch) {
    return { error: "Invalid password." };
  }

  // Success
  await createClientSession(targetClient.slug.current);
  redirect(`/${targetClient.slug.current}/dashboard`);
}
