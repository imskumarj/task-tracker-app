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
} from "lucide-react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
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
      } else if (data.user.role === "instructor") {
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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Welcome back</h1>
      <p className="text-sm text-muted-foreground -mt-2">Sign in to your TaskBoard account.</p>
      <div className="space-y-1.5">
        <Label htmlFor="li-email">Email</Label>
        <Input id="li-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="li-password">Password</Label>
        <Input id="li-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
      </div>
      <Button type="submit" disabled={busy} className="w-full h-11 text-base">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const [role, setRole] = useState<"instructor" | "student">("student");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    college: "",
    semester: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        <RoleButton active={role === "student"} onClick={() => setRole("student")} icon={<GraduationCap className="h-4 w-4" />} label="Student" />
        <RoleButton active={role === "instructor"} onClick={() => setRole("instructor")} icon={<Briefcase className="h-4 w-4" />} label="Instructor" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Full name"><Input required value={form.full_name} onChange={set("full_name")} className="h-11" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input required type="email" value={form.email} onChange={set("email")} className="h-11" /></Field>
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

      <Button type="submit" disabled={busy} className="w-full h-11 text-base">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
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

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
        active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}
