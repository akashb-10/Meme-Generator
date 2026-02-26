"use client";

import { useState } from "react";
import { db } from "@/lib/db";

type AuthGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function AuthGate({ children, fallback }: AuthGateProps) {
  const { isLoading, user } = db.useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="text-muted">Loading...</span>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
      setStep("code");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send code";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-xl border border-border bg-surface p-8">
      <h2 className="mb-6 text-lg font-semibold text-[#e0e0e0]">
        Sign in to continue
      </h2>
      {step === "email" ? (
        <form onSubmit={handleSendCode} className="w-full space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-[#e0e0e0] placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send magic code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="w-full space-y-4">
          <p className="text-center text-sm text-muted">
            We sent a 6-digit code to {sentEmail}
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-center text-xl tracking-[0.5em] text-[#e0e0e0] placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || code.length !== 6}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-muted hover:text-accent"
          >
            Use a different email
          </button>
        </form>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
