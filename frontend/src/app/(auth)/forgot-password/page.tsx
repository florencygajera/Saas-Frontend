"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={success ? "Check Your Email" : "Forgot Password?"}
      subtitle={
        success
          ? "We sent reset instructions to your email address."
          : "Enter your email and we'll send a reset link."
      }
      sideTitle="We'll help you get back in"
      sideDescription="Secure recovery flow to restore access to your account quickly."
      sideFeatures={["Secure password reset", "Email verification", "Fast account recovery"]}
      backHref="/login"
      backLabel={
        <>
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </>
      }
      gradientClassName="from-indigo-700 via-blue-700 to-cyan-700"
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Use the link in your inbox to continue.</p>
          <Button asChild className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" {...register("email")} className="pl-10" placeholder="you@example.com" />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
