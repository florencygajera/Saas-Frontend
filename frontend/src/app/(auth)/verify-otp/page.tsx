"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleSubmit = async (code: string) => {
    if (code.length < 6 || !email) return;

    try {
      setLoading(true);
      setError(null);
      await authApi.verifyOtp(email, code);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to verify OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      void handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => d === "");
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      void handleSubmit(newOtp.join(""));
    }
  };

  const resendOtp = async () => {
    if (!email) return;
    try {
      setError(null);
      await authApi.resendOtp(email);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to resend OTP"));
    }
  };

  return (
    <AuthShell
      title={success ? "Verified" : "Verify Your Account"}
      subtitle={
        success
          ? "Your account verification is complete."
          : `Enter the 6-digit code sent to ${email || "your email"}.`
      }
      sideTitle="One step away from your account"
      sideDescription="Complete email verification to unlock your workspace."
      sideFeatures={[
        "Secure account activation",
        "Fast OTP verification",
        "Protected login access",
      ]}
      backHref="/login"
      backLabel={
        <>
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </>
      }
      gradientClassName="from-cyan-700 via-blue-700 to-indigo-700"
    >
      {!email ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Missing email. Please sign up again to receive OTP.</AlertDescription>
        </Alert>
      ) : null}

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
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Verified!</h2>
            <p className="text-muted-foreground">Your account has been verified successfully.</p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Continue to Sign In</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-14 w-11 text-center text-xl font-bold sm:w-12"
                disabled={loading || !email}
              />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
            <button onClick={resendOtp} className="font-medium text-primary hover:underline" type="button">
              Resend
            </button>
          </div>
        </>
      )}
    </AuthShell>
  );
}
