"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin } from "@/app/actions/adminAuth";

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display uppercase tracking-wider mb-2 text-brand-green-light">System Admin</h1>
          <p className="text-zinc-500 font-sans text-sm">Restricted Access.</p>
        </div>
        
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              name="password"
              placeholder="Admin Password"
              required
              className="w-full bg-zinc-900 border-zinc-800 h-14 px-4 uppercase font-sans tracking-widest text-base sm:text-sm placeholder:text-zinc-600 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
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
