"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/inputField";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

type ForgotFormData = {
  email: string;
};

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotFormData>({
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to request password reset.");
      }

      setSubmitted(true);
      reset();
      toast.success("If an account exists, a reset link will be sent.");
    } catch (e) {
      console.error(e);
      toast.success("If an account exists, a reset link will be sent.");
    }
  };

  return (
    <>
      <h1 className="form-title">Forgot Password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
           pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      {submitted && (
        <p className="text-sm text-green-500 mt-4">
          Check your email for a reset link.{" "}
          <Link href="/sign-in" className="underline">
            Return to sign in
          </Link>
          .
        </p>
      )}
    </>
  );
};

export default ForgotPasswordPage;
