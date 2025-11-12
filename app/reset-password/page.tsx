"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  validatePassword,
} from "@/lib/validation/password";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const verify = async () => {
      if (!token) {
        setValid(false);
        setError("This link is invalid or has expired.");
        setVerifying(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
          }
        );
        const json = await res.json();
        if (ignore) return;
        if (res.ok && json?.valid) {
          setValid(true);
          setError(null);
        } else {
          setValid(false);
          setError(json?.message || "This link is invalid or has expired.");
        }
      } catch {
        if (ignore) return;
        setValid(false);
        setError("This link is invalid or has expired.");
      } finally {
        if (!ignore) setVerifying(false);
      }
    };
    verify();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!token) {
      toast.error("Invalid reset token.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const check = validatePassword(password);
    if (!check.valid) {
      toast.error(check.message || "Invalid password.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) {
        const message =
          json?.error || json?.message || "Failed to reset password.";
        setApiError(message);
        throw new Error(message);
      }
      toast.success("Password updated! Redirecting to sign-in...");
      // Prefer environment base URL if provided
      const base = process.env.NEXT_PUBLIC_BASE_URL || "";
      setTimeout(() => {
        if (base) {
          window.location.href = `${base}/sign-in`;
        } else {
          router.push("/sign-in");
        }
      }, 2000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-input/60 rounded-lg p-6 bg-background/60 backdrop-blur">
        <h1 className="form-title text-center">Set a New Password</h1>
        {verifying ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span>Verifying link...</span>
          </div>
        ) : !valid ? (
          <div className="py-6 text-center">
            <p className="text-red-500 mb-4">
              {error || "This link is invalid or has expired."}
            </p>
            <a
              className="text-primary underline underline-offset-4"
              href={
                (process.env.NEXT_PUBLIC_BASE_URL || "") + "/forgot-password"
              }
            >
              Request a new reset link
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {apiError && <p className="text-sm text-red-500">{apiError}</p>}
            <div className="space-y-2">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="form-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={
                    password.length > 0 && !validatePassword(password).valid
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters, including at least 1 letter and 1 number.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="form-input pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={
                    confirmPassword.length > 0 && confirmPassword !== password
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="yellow-btn w-full mt-2"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Setting Password...
                </span>
              ) : (
                "Set New Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;
