"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin } from "@/app/actions/adminAuth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-brand-green hover:bg-brand-green-light text-white font-display uppercase tracking-widest text-lg disabled:opacity-50 transition-colors"
    >
      {pending ? "Verifying..." : "Authorize"}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useFormState(loginAdmin, null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display uppercase tracking-wider mb-2 text-brand-green-light">System Admin</h1>
          <p className="text-zinc-500 font-sans text-sm">Restricted Access.</p>
        </div>
        
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Admin Password"
                required
                className="w-full bg-zinc-900 border-zinc-800 h-14 pl-4 pr-12 font-sans tracking-widest text-base sm:text-sm placeholder:text-zinc-600 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
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
            <p className="text-brand-red font-sans text-sm font-medium">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
