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

  const rawIdentifier = (formData.get("slug") as string)?.trim() || "";
  const password = (formData.get("password") as string)?.trim() || "";

  if (!password) {
    return { error: "Password is required." };
  }

  const lowerIdentifier = rawIdentifier.toLowerCase();
  const compactIdentifier = lowerIdentifier.replace(/[\s-_]+/g, "");
  const slugFromRaw = lowerIdentifier.replace(/[\s_]+/g, "-");

  const adminPassword = process.env.ADMIN_PASSWORD;

  // 1. Check if entering with Agency Admin Password
  if (adminPassword && password === adminPassword) {
    // Agency Admin direct sign-in identifiers
    const isAdminIdentifier =
      !rawIdentifier ||
      compactIdentifier === "fluxiolive" ||
      compactIdentifier === "fluxio" ||
      compactIdentifier === "admin" ||
      compactIdentifier === "agency";

    if (isAdminIdentifier) {
      await createAdminSession();
      redirect("/admin/clients");
    }

    // Admin entering client identifier to directly preview client dashboard as Admin
    const clientQuery = `*[_type == "client" && (
      slug.current == $rawIdentifier ||
      lower(slug.current) == $lowerIdentifier ||
      lower(slug.current) == $slugFromRaw ||
      lower(slug.current) == $compactIdentifier ||
      lower(name) == $lowerIdentifier
    )][0]`;

    const targetClient = await client.fetch<ClientDoc | null>(clientQuery, {
      rawIdentifier,
      lowerIdentifier,
      slugFromRaw,
      compactIdentifier,
    });

    if (targetClient?.slug?.current) {
      await createAdminSession();
      redirect(`/${targetClient.slug.current}/dashboard`);
    }

    // Fallback if identifier didn't match a specific client: enter admin suite
    await createAdminSession();
    redirect("/admin/clients");
  }

  // 2. Standard Client Credentials Verification
  if (!rawIdentifier) {
    return { error: "Brand identifier is required." };
  }

  const clientQuery = `*[_type == "client" && (
    slug.current == $rawIdentifier ||
    lower(slug.current) == $lowerIdentifier ||
    lower(slug.current) == $slugFromRaw ||
    lower(slug.current) == $compactIdentifier ||
    lower(name) == $lowerIdentifier
  )][0]`;

  const clientData = await client.fetch<ClientDoc | null>(clientQuery, {
    rawIdentifier,
    lowerIdentifier,
    slugFromRaw,
    compactIdentifier,
  });

  if (!clientData) {
    return { error: "Invalid brand identifier or password." };
  }

  if (clientData.status === "paused") {
    return { error: "This brand account is currently paused. Please contact agency support." };
  }

  const isMatch = await bcrypt.compare(password, clientData.passwordHash);
  if (!isMatch) {
    return { error: "Invalid brand identifier or password." };
  }

  await createClientSession(clientData.slug.current);
  redirect(`/${clientData.slug.current}/dashboard`);
}
