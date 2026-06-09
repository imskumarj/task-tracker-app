"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  useAuth
} from "@/context/AuthContext";

import {
  ClipboardCheck,
  GraduationCap,
  Briefcase,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  KeyRound,
} from "lucide-react";

import {
  forgotPasswordSendOtp,
  forgotPasswordReset,
  registerSendOtp,
  registerVerifyOtp,
} from "@/services/auth";

import { toast } from "sonner";

import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "instructor") {
        router.push("/instructor");
      } else if (user.role === "student") {
        router.push("/student");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen label="Starting up" />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="hidden md:flex flex-col justify-between bg-[oklch(0.26_0.09_260)] text-white p-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(600px 400px at 20% 10%, oklch(0.42 0.16 258 / 0.6), transparent 60%), radial-gradient(700px 500px at 90% 90%, oklch(0.55 0.2 250 / 0.45), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white text-[oklch(0.26_0.09_260)] flex items-center justify-center shadow-elegant">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-display font-bold">TaskBoard</span>
          </div>
          <h2 className="mt-16 text-4xl font-display font-bold leading-tight">
            Clear tasks.<br />Calm workflows.<br />Confident teaching.
          </h2>
          <p className="mt-5 text-white/75 max-w-md leading-relaxed">
            A purpose-built workspace for instructors and students. Assign work, share resources, evaluate
            submissions — all in one professional, easy-to-use place.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-white/80 text-sm">
          <Feature icon={<Briefcase className="h-4 w-4" />} label="For instructors" />
          <Feature icon={<GraduationCap className="h-4 w-4" />} label="For students" />
          <Feature icon={<ClipboardCheck className="h-4 w-4" />} label="For admins" />
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-display font-bold">TaskBoard</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-11">
              <TabsTrigger value="login" className="text-sm">Sign in</TabsTrigger>
              <TabsTrigger value="register" className="text-sm">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="h-7 w-7 rounded bg-white/10 flex items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const [fpStep, setFpStep] = useState<1 | 2>(1);

  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPassword, setFpPassword] = useState("");

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setBusy(true);

    try {
      const data = await login(
        email,
        password
      );

      toast.success("Welcome back");

      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (
        data.user.role === "instructor"
      ) {
        router.push("/instructor");
      } else {
        router.push("/student");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Login failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(fpEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setBusy(true);

      await forgotPasswordSendOtp(
        fpEmail
      );

      setFpStep(2);
      setTimer(60);

      toast.success(
        "OTP sent to your email"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to send OTP"
      );
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setBusy(true);

    try {
      await forgotPasswordSendOtp(
        fpEmail
      );

      setTimer(60);

      toast.success(
        "OTP resent successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to resend OTP"
      );
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setBusy(true);

      await forgotPasswordReset({
        email: fpEmail,
        otp: fpOtp,
        password: fpPassword,
      });

      toast.success(
        "Password updated successfully"
      );

      setMode("login");
      setFpStep(1);

      setFpEmail("");
      setFpOtp("");
      setFpPassword("");
      setTimer(0);
      setEmail(fpEmail);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Password reset failed"
      );
    } finally {
      setBusy(false);
    }
  };

  if (mode === "forgot") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setFpStep(1);

            setFpEmail("");
            setFpOtp("");
            setFpPassword("");
            setTimer(0);
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <h1 className="text-2xl font-display font-bold">
          Reset Password
        </h1>

        <p className="text-sm text-muted-foreground">
          Enter your registered email
          address to receive an OTP.
        </p>

        {fpStep === 1 && (
          <>
            <div className="space-y-1.5">
              <Label>Email</Label>

              <Input
                type="email"
                value={fpEmail}
                onChange={(e) =>
                  setFpEmail(
                    e.target.value
                  )
                }
                className="h-11"
              />
            </div>

            <Button
              type="button"
              onClick={sendOtp}
              disabled={busy}
              className="w-full h-11"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>
          </>
        )}

        {fpStep === 2 && (
          <form
            onSubmit={resetPassword}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>
                Email OTP
              </Label>

              <Input
                minLength={6}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={fpOtp}
                onChange={(e) =>
                  setFpOtp(
                    e.target.value
                  )
                }
                placeholder="Enter OTP"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                New Password
              </Label>

              <Input
                type="password"
                minLength={6}
                value={fpPassword}
                onChange={(e) =>
                  setFpPassword(
                    e.target.value
                  )
                }
                className="h-11"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              OTP expires in 10
              minutes.
            </div>

            {timer > 0 ? (
              <div className="text-xs text-muted-foreground">
                Resend OTP in{" "}
                {timer}s
              </div>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-11"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-4"
    >
      <h1 className="text-2xl font-display font-bold">
        Welcome back
      </h1>

      <p className="text-sm text-muted-foreground -mt-2">
        Sign in to your TaskBoard
        account.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="li-email">
          Email
        </Label>

        <Input
          id="li-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="li-password">
          Password
        </Label>

        <Input
          id="li-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="h-11"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setMode("forgot")
          }
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="w-full h-11 text-base"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const [role, setRole] = useState<"instructor" | "student">("student");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] =
    useState(false);
  const [timer, setTimer] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    college: "",
    semester: "",
  });

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      toast.error(
        "Please enter a valid email"
      );
      return;
    }

    try {
      setBusy(true);

      await registerSendOtp(
        form.email
      );

      setStep(2);

      setTimer(60);

      toast.success(
        "Verification OTP sent"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Unable to send OTP"
      );
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error(
        "Please enter OTP"
      );

      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setBusy(true);

      await registerVerifyOtp(
        form.email,
        otp
      );

      setOtp("");
      setOtpVerified(true);

      toast.success(
        "Email verified successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Invalid OTP"
      );
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setBusy(true);
    try {
      await registerSendOtp(
        form.email
      );

      setTimer(60);

      toast.success(
        "OTP resent successfully"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Unable to resend OTP"
      );
    } finally {      
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error(
        "Please verify your email first"
      );

      return;
    }

    setBusy(true);

    try {
      await register({
        ...form,
        role,
      });

      toast.success(
        role === "instructor"
          ? "Account created — awaiting admin approval"
          : "Account created successfully"
      );

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        college: "",
        semester: "",
      });

      setRole("student");
      setStep(1);
      setOtp("");
      setOtpVerified(false);
      setTimer(0);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Registration failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Create an account</h1>
      <p className="text-sm text-muted-foreground -mt-2">Pick the role that matches you.</p>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted">
        <RoleButton active={role === "student"} disabled={otpVerified} onClick={() => setRole("student")} icon={<GraduationCap className="h-4 w-4" />} label="Student" />
        <RoleButton active={role === "instructor"} disabled={otpVerified} onClick={() => setRole("instructor")} icon={<Briefcase className="h-4 w-4" />} label="Instructor" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Full name"><Input required value={form.full_name} onChange={set("full_name")} className="h-11" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input required type="email" disabled={step === 2 || otpVerified} value={form.email} onChange={set("email")} className="h-11" /></Field>
          <Field label="Phone"><Input required value={form.phone} onChange={set("phone")} className="h-11" /></Field>
        </div>
        {role === "student" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="College"><Input required value={form.college} onChange={set("college")} className="h-11" /></Field>
            <Field label="Semester"><Input required value={form.semester} onChange={set("semester")} className="h-11" /></Field>
          </div>
        )}
        <Field label="Password" hint="Minimum 6 characters">
          <Input required type="password" minLength={6} value={form.password} onChange={set("password")} className="h-11" />
        </Field>
      </div>

      {!otpVerified ? (
      <>
        {step === 1 && (
          <Button
            type="button"
            onClick={sendOtp}
            disabled={busy}
            className="w-full h-11"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Verify Email
              </>
            )}
          </Button>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email OTP</Label>

              <Input
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
                }
                placeholder="Enter OTP"
                className="h-11"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              OTP expires in 10 minutes.
            </div>

            {timer > 0 ? (
              <div className="text-xs text-muted-foreground">
                Resend OTP in {timer}s
              </div>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            )}

            <Button
              type="button"
              onClick={verifyOtp}
              disabled={busy}
              className="w-full h-11"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify OTP
                </>
              )}
            </Button>
          </div>
        )}
      </>
    ) : (
      <Button
        type="submit"
        disabled={busy}
        className="w-full h-11 text-base"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Create Account"
        )}
      </Button>
    )}
      {role === "instructor" && (
        <p className="text-xs text-muted-foreground text-center">
          Instructor accounts are reviewed by an administrator before activation.
        </p>
      )}
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RoleButton({ active, disabled, onClick, icon, label }: { active: boolean; disabled?: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
        active
          ? "bg-surface text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground"
      } ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
    >
      {icon} {label}
    </button>
  );
}
