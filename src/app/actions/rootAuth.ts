import { createClientSession, createAdminSession } from "@/lib/auth";
import bcrypt from "bcrypt";
import { client, ClientDoc } from "@/lib/sanity";

export interface RootAuthState {
  error?: string;
  redirectUrl?: string;
}

export async function loginRoot(
  prevState: RootAuthState | null,
  formData: FormData
): Promise<RootAuthState> {
  try {
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

    if (adminPassword && password === adminPassword) {
      const isAdminIdentifier =
        !rawIdentifier ||
        compactIdentifier === "fluxiolive" ||
        compactIdentifier === "fluxio" ||
        compactIdentifier === "admin" ||
        compactIdentifier === "agency";

      if (isAdminIdentifier) {
        await createAdminSession();
        return { redirectUrl: "/admin/clients" };
      } else {
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
          return { redirectUrl: `/${targetClient.slug.current}/dashboard` };
        } else {
          await createAdminSession();
          return { redirectUrl: "/admin/clients" };
        }
      }
    } else {
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

      if (!clientData || !clientData.slug?.current) {
        return { error: "Invalid brand identifier or password." };
      }

      if (clientData.status === "paused") {
        return { error: "This brand account is currently paused. Please contact agency support." };
      }

      if (!clientData.passwordHash) {
        return { error: "Account authentication is not configured. Please contact agency support." };
      }

      const isMatch = await bcrypt.compare(password, clientData.passwordHash);
      if (!isMatch) {
        return { error: "Invalid brand identifier or password." };
      }

      await createClientSession(clientData.slug.current);
      return { redirectUrl: `/${clientData.slug.current}/dashboard` };
    }
  } catch (err: unknown) {
    console.error("Root login error:", err);
    return { error: "An unexpected error occurred during sign in. Please try again." };
  }
}
