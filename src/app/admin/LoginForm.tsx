"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div>
        <label className="block mb-2 text-xs uppercase tracking-[0.25em] text-neutral-400">
          Admin Password
        </label>
        <input
          name="password"
          type="password"
          autoFocus
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-400"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-100 py-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
