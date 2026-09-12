"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginRoot } from "@/app/actions/rootAuth";
import { Eye, EyeOff } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-brand-red hover:bg-red-700 text-white font-display uppercase tracking-widest text-lg disabled:opacity-50 transition-colors"
    >
      {pending ? "Unlocking..." : "Enter"}
    </button>
  );
}

export default function Home() {
  const [state, formAction] = useFormState(loginRoot, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-2">
            Fluxio Live
          </h1>
          <p className="text-zinc-500 font-sans text-xs uppercase tracking-widest">
            Client & Agency Portal
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Brand Identifier
            </label>
            <input
              type="text"
              name="slug"
              placeholder="e.g. acme or fluxio live"
              className="w-full bg-zinc-900 border-zinc-800 h-12 sm:h-14 px-4 uppercase font-sans tracking-wider text-base sm:text-sm placeholder:text-zinc-600 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                className="w-full bg-zinc-900 border-zinc-800 h-12 sm:h-14 pl-4 pr-12 font-sans tracking-widest text-base sm:text-sm placeholder:text-zinc-600 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-brand-red font-sans text-xs font-medium pt-1">
              {state.error}
            </p>
          )}

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>

        <div className="pt-4 border-t border-zinc-900 text-center text-xs font-mono uppercase tracking-widest text-zinc-600">
          <span>Private Client & Agency Access</span>
        </div>
      </div>
    </div>
  );
}
