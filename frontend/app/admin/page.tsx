import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Users, GraduationCap, Briefcase, CheckCircle2, XCircle, Trash2, Plus, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — TaskBoard" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { loading, session, profile } = useAuth();
  if (loading) return <LoadingScreen label="Verifying access" />;
  if (!session) return <Navigate to="/" />;
  if (profile?.role !== "admin") return <Navigate to="/" />;

  return (
    <AppShell title="Admin console" subtitle="Manage users, instructors, and tasks across the platform.">
      <Tabs defaultValue="instructors" className="space-y-6">
        <TabsList className="h-11">
          <TabsTrigger value="instructors" className="gap-2"><Briefcase className="h-4 w-4" />Instructors</TabsTrigger>
          <TabsTrigger value="students" className="gap-2"><GraduationCap className="h-4 w-4" />Students</TabsTrigger>
          <TabsTrigger value="admins" className="gap-2"><ShieldCheck className="h-4 w-4" />Admins</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2"><ClipboardList className="h-4 w-4" />All tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="instructors"><InstructorsPanel /></TabsContent>
        <TabsContent value="students"><PeoplePanel role="student" /></TabsContent>
        <TabsContent value="admins"><AdminsPanel /></TabsContent>
        <TabsContent value="tasks"><AllTasksPanel /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function InstructorsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("role", "instructor").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setApproval = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("profiles").update({ approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-instructors"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Instructor removed"); qc.invalidateQueries({ queryKey: ["admin-instructors"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <PanelLoading />;
  return (
    <div className="grid gap-3">
      {data?.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No instructors yet" />}
      {data?.map((p) => (
        <Card key={p.id} className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
            {p.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium flex items-center gap-2">
              {p.full_name}
              {p.approved ? <Badge variant="secondary" className="bg-success/15 text-success border-success/30">Approved</Badge> : <Badge variant="secondary" className="bg-warning/15 text-warning-foreground border-warning/30">Pending</Badge>}
            </div>
            <div className="text-xs text-muted-foreground truncate">{p.email} · {p.phone}</div>
          </div>
          <div className="flex items-center gap-2">
            {p.approved ? (
              <Button variant="outline" size="sm" onClick={() => setApproval.mutate({ id: p.id, approved: false })}>
                <XCircle className="h-4 w-4 mr-1.5" />Revoke
              </Button>
            ) : (
              <Button size="sm" onClick={() => setApproval.mutate({ id: p.id, approved: true })}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />Approve
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remove this instructor?")) remove.mutate(p.id); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PeoplePanel({ role }: { role: "student" | "admin" }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-people", role],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("role", role).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-people", role] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (isLoading) return <PanelLoading />;
  return (
    <div className="grid gap-3">
      {data?.length === 0 && <EmptyState icon={<Users className="h-5 w-5" />} title={`No ${role}s yet`} />}
      {data?.map((p) => (
        <Card key={p.id} className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
            {p.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{p.full_name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {p.email} · {p.phone}{p.college ? ` · ${p.college}` : ""}{p.semester ? ` · Sem ${p.semester}` : ""}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remove this user?")) remove.mutate(p.id); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

function AdminsPanel() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const promote = async () => {
    if (!email) return;
    setBusy(true);
    // Find profile by email
    const { data: p, error } = await supabase.from("profiles").select("id").eq("email", email.trim()).maybeSingle();
    if (error || !p) { setBusy(false); return toast.error("User not found. They must register first."); }
    const { error: e1 } = await supabase.from("profiles").update({ role: "admin", approved: true }).eq("id", p.id);
    const { error: e2 } = await supabase.from("user_roles").insert({ user_id: p.id, role: "admin" });
    setBusy(false);
    if (e1 || (e2 && !e2.message.includes("duplicate"))) return toast.error((e1 ?? e2)!.message);
    toast.success("Promoted to admin");
    setEmail(""); setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-people", "admin"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Add or remove other administrators.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" />Add admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote a user to admin</DialogTitle>
              <DialogDescription>The user must already have a TaskBoard account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" className="h-11" />
            </div>
            <DialogFooter>
              <Button onClick={promote} disabled={busy || !email}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Promote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <PeoplePanel role="admin" />
      <p className="text-xs text-muted-foreground">Signed in as <strong>{profile?.email}</strong></p>
    </div>
  );
}

function AllTasksPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, profiles!tasks_instructor_id_fkey(full_name,email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Task removed"); qc.invalidateQueries({ queryKey: ["admin-tasks"] }); },
  });
  if (isLoading) return <PanelLoading />;
  return (
    <div className="grid gap-3">
      {data?.length === 0 && <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No tasks yet" />}
      {data?.map((t: any) => (
        <Card key={t.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-muted-foreground">
                by {t.profiles?.full_name ?? "—"} · {new Date(t.created_at).toLocaleDateString()}
                {t.assigned_to_all && <Badge variant="secondary" className="ml-2">All students</Badge>}
              </div>
              {t.content && <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{t.content}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this task?")) remove.mutate(t.id); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-shimmer" />)}
    </div>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">{icon}</div>
      <p className="mt-3 text-sm text-muted-foreground">{title}</p>
    </Card>
  );
}
