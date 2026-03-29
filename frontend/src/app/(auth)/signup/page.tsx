"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Account Created"
        subtitle="Your sign-up request is complete."
        sideTitle="You are almost ready to launch"
        sideDescription="Verify your email and continue into your workspace."
        sideFeatures={["Secure onboarding", "Guided setup", "Role-based access"]}
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Account created!</h2>
            <p className="text-muted-foreground">Redirecting to email verification.</p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create An Account"
      subtitle="Start your free trial today."
      sideTitle="Start growing your business today"
      sideDescription="Join teams using SaaS Platform to manage appointments, customers, and revenue."
      sideStats={[
        { label: "10K+", description: "Active businesses" },
        { label: "1M+", description: "Appointments booked" },
        { label: "99.9%", description: "Uptime guarantee" },
        { label: "24/7", description: "Customer support" },
      ]}
      gradientClassName="from-cyan-700 via-blue-700 to-indigo-700"
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" {...register("name")} className="pl-10" placeholder="John Doe" />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" {...register("email")} className="pl-10" placeholder="you@example.com" />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="pl-10 pr-10"
              placeholder="��������"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="pl-10"
              placeholder="��������"
            />
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
