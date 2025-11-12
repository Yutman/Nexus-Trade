"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

const SignIn = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("Sign in failed", {
        description:
          e instanceof Error ? e.message : "Failed to login to your account.",
      });
    }
  };

  return (
    <>
      <h1 className="form-title">Log In Your Account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="johndoe@email.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email name is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
        />

        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ required: "Password is required", minLength: 8 }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Logging In" : "Log in"}
        </Button>

        <div className="flex items-center justify-center">
          <FooterLink
            text=""
            linkText="Forgot Password?"
            href="/forgot-password"
          />
        </div>

        <FooterLink
          text="Don't have an account?"
          linkText="Create an account"
          href="/sign-up"
        />
      </form>
    </>
  );
};
export default SignIn;
