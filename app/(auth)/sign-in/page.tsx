"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

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

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignInFormData) => {
    try {
      setPasswordError(null);
      const result = await signInWithEmail(data);
      if (result.success) {
        router.push("/");
      } else if (result.error === "Invalid password") {
        setPasswordError("Invalid password");
      } else if (result.error) {
        toast.error("Sign in failed", {
          description: result.error,
        });
      }
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

        <div className="space-y-2">
          <Label htmlFor="password" className="form-label">
            Password
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              className="form-input pr-10"
              aria-invalid={Boolean(errors.password || passwordError)}
              {...register("password", { required: "Password is required", minLength: 8 })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {(errors.password || passwordError) && (
            <p className="text-sm text-red-500">
              {errors.password?.message || passwordError}
            </p>
          )}
        </div>

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
