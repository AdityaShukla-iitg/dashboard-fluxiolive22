"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginClient } from "@/app/actions/clientAuth";

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

export default function ClientLogin({ params }: { params: { slug: string } }) {
  // Bind the slug to the server action
  const actionWithSlug = loginClient.bind(null, params.slug);
  const [state, formAction] = useFormState(actionWithSlug, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display uppercase tracking-wider mb-2">Client Access</h1>
          <p className="text-zinc-500 font-sans text-sm">Enter your password to view deliverables.</p>
        </div>
        
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full bg-zinc-900 border-zinc-800 h-14 px-4 uppercase font-sans tracking-widest placeholder:text-zinc-600 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
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
