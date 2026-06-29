"use client";

/** Shared input styling + label wrapper for the guests admin forms. */

import { createContext, useContext, useRef, useTransition } from "react";

export const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400";

/** Carries the enclosing ActionForm's pending state down to its SubmitButton. */
const FormPendingContext = createContext(false);

/**
 * A <form> whose server action runs inside a useTransition, so the busy state
 * is tied directly to the action's promise resolving — not to the router
 * refresh that revalidatePath kicks off. Plain useFormStatus on a
 * <form action={serverAction}> can stay stuck on "Saving…" after a successful
 * write (e.g. creating a party) because its transition keeps waiting on that
 * refresh; driving it ourselves avoids that.
 *
 * resetOnSuccess clears the fields after the action so a persistent form (like
 * "Add a party") is ready for the next entry instead of keeping stale values.
 */
export function ActionForm({
  action,
  className,
  resetOnSuccess = false,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  resetOnSuccess?: boolean;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className={className}
      action={(formData) =>
        startTransition(async () => {
          await action(formData);
          if (resetOnSuccess) formRef.current?.reset();
        })
      }
    >
      <FormPendingContext.Provider value={pending}>
        {children}
      </FormPendingContext.Provider>
    </form>
  );
}

/** Submit button that reflects its enclosing ActionForm's pending state. */
export function SubmitButton({
  idle,
  busy,
  className,
}: {
  idle: string;
  busy: string;
  className: string;
}) {
  const pending = useContext(FormPendingContext);
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? busy : idle}
    </button>
  );
}

export function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
