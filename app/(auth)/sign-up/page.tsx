'use client'

import React, { useState } from 'react'
import {Button} from '@/components/ui/button';
import {useForm} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import InputField from '@/components/forms/inputField';
import {CountrySelectField} from '@/components/forms/CountrySelectField';
import SelectField from '@/components/forms/SelectField';
import {signUpWithEmail} from "@/lib/actions/auth.actions";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";
import FooterLink from '@/components/forms/FooterLink';
import {toast} from "sonner";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const router = useRouter()
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'KE',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    }, );

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if(result.success) router.push('/');
        } catch (e) {
            console.error(e);
            toast.error('Sign up failed', {
                description: e instanceof Error ? e.message : 'Failed to create an account.'
            })
        }
    }

   return (
        <>
            <h1 className="form-title">Sign Up & Personalize</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label="Full Name"
                    placeholder="John Doe"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: 'Full name is required', minLength: {value: 2, message: 'Full name must be at least 2 characters'}}}
                />


            <InputField
                    name="email"
                    label="Email"
                    placeholder="johndoe@email.com"
                    register={register}
                    error={errors.email}
                    validation={{ 
                        required: 'Email is required',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address'
                        }
                    }}
                />

                <div className="space-y-2">
                    <Label htmlFor="password" className="form-label">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter a strong password"
                            className="form-input pr-10"
                            aria-invalid={Boolean(errors.password)}
                            {...register('password', { required: 'Password is required', minLength: 8 })}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-2 my-auto text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                
                <CountrySelectField
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required
                />

                <SelectField
                    name="investmentGoals"
                    label="Investment Goals"
                    placeholder="Select your investment goal"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />

                <SelectField
                    name="riskTolerance"
                    label="Risk Tolerance"
                    placeholder="Select your risk level"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />

                <SelectField
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select your preferred industry"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Start Your Investing Journey'}
                </Button>

                <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    )
}
export default SignUp;