import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, BookOpen, Lock, FileText, Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { uploadTaskDocument } from "@/lib/upload";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student — TaskBoard" }] }),
  component: StudentPage,
});

function StudentPage() {
  const { loading, session, profile } = useAuth();
  if (loading) return <LoadingScreen label="Verifying access" />;
  if (!session) return <Navigate to="/" />;
  if (profile?.role !== "student") return <Navigate to="/" />;

  return (
    <AppShell title={`Hello, ${profile.full_name.split(" ")[0]}`} subtitle="Your tasks, submissions, and shared resources.">
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="h-11">
          <TabsTrigger value="tasks" className="gap-2"><ClipboardList className="h-4 w-4" />My tasks</TabsTrigger>
          <TabsTrigger value="resources" className="gap-2"><BookOpen className="h-4 w-4" />Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks"><MyTasks /></TabsContent>
        <TabsContent value="resources"><MyResources /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function MyTasks() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["student-tasks", user?.id],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*, profiles!tasks_instructor_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (tasks ?? []).map((t) => t.id);
      if (ids.length === 0) return [];
      const { data: subs } = await supabase
        .from("submissions")
        .select("*, evaluations(*)")
        .eq("student_id", user!.id)
        .in("task_id", ids)
        .order("attempt_number", { ascending: false });
      return tasks!.map((t) => {
        const taskSubs = (subs ?? []).filter((s) => s.task_id === t.id);
        return { ...t, submissions: taskSubs };
      });
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-32 rounded-lg bg-muted animate-shimmer" />)}</div>;
  if (!data || data.length === 0) {
    return <Card className="p-12 text-center"><ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No tasks assigned yet.</p></Card>;
  }

  return (
    <div className="grid gap-3">
      {data.map((t: any) => <TaskCard key={t.id} task={t} />)}
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const [open, setOpen] = useState(false);
  const latestSub = task.submissions?.[0];
  const latestEval = latestSub?.evaluations;
  // Locked when there's a submission without a "needs_resubmit" evaluation
  const locked = latestSub && (!latestEval || latestEval.status === "evaluated");
  const needsResubmit = latestEval?.status === "needs_resubmit";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            {locked && <Badge className="bg-success/15 text-success border-success/30"><Lock className="h-3 w-3 mr-1" />Submitted</Badge>}
            {needsResubmit && <Badge className="bg-warning/20 text-warning-foreground border-warning/40"><AlertCircle className="h-3 w-3 mr-1" />Resubmit</Badge>}
            {!latestSub && <Badge variant="secondary">Pending</Badge>}
            {task.due_date && <Badge variant="outline">Due {new Date(task.due_date).toLocaleDateString()}</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">From {task.profiles?.full_name ?? "Instructor"}</p>
          {task.content && <p className="mt-3 text-sm whitespace-pre-wrap">{task.content}</p>}
          {task.document_url && <a href={task.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><FileText className="h-3.5 w-3.5" />Task attachment</a>}
        </div>
      </div>

      {latestEval && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-sm font-medium">
            {latestEval.status === "needs_resubmit" ? <AlertCircle className="h-4 w-4 text-warning-foreground" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
            Instructor feedback {latestEval.grade && <span className="text-muted-foreground font-normal">· Grade: {latestEval.grade}</span>}
          </div>
          {latestEval.feedback && <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">{latestEval.feedback}</p>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {latestSub ? `Last submitted ${new Date(latestSub.created_at).toLocaleString()}` : "No submission yet"}
        </span>
        {locked ? (
          <Button variant="outline" size="sm" disabled><Lock className="h-4 w-4 mr-1.5" />Locked</Button>
        ) : (
          <Button size="sm" onClick={() => setOpen(true)}><Upload className="h-4 w-4 mr-1.5" />{needsResubmit ? "Resubmit" : "Submit response"}</Button>
        )}
      </div>

      <SubmitDialog open={open} onOpenChange={setOpen} task={task} attempt={(latestSub?.attempt_number ?? 0) + 1} />
    </Card>
  );
}

function SubmitDialog({ open, onOpenChange, task, attempt }: any) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!content.trim() && !file) return toast.error("Add a response or file");
    setBusy(true);
    try {
      let documentUrl: string | null = null;
      if (file) documentUrl = await uploadTaskDocument(file, user!.id);
      const { error } = await supabase.from("submissions").insert({
        task_id: task.id, student_id: user!.id, attempt_number: attempt, content: content.trim() || null, document_url: documentUrl,
      });
      if (error) throw error;
      toast.success("Submitted");
      qc.invalidateQueries({ queryKey: ["student-tasks"] });
      onOpenChange(false); setContent(""); setFile(null);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit your response</DialogTitle>
          <DialogDescription>{task.title} — attempt #{attempt}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Your response</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Write your response..." /></div>
          <div className="space-y-1.5"><Label>Attach a document (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-11" /></div>
          <p className="text-xs text-muted-foreground">Once submitted, your response is locked until your instructor reviews it.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MyResources() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, profiles!resources_instructor_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-shimmer" />)}</div>;
  if (!data || data.length === 0) {
    return <Card className="p-12 text-center"><BookOpen className="h-10 w-10 mx-auto text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No resources shared yet.</p></Card>;
  }

  return (
    <div className="grid gap-3">
      {data.map((r: any) => (
        <Card key={r.id} className="p-4 flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
          <div className="flex-1">
            <h4 className="font-semibold">{r.title}</h4>
            <p className="text-xs text-muted-foreground">From {r.profiles?.full_name ?? "Instructor"} · {new Date(r.created_at).toLocaleDateString()}</p>
            {r.description && <p className="mt-1.5 text-sm">{r.description}</p>}
            {r.document_url && <a href={r.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><FileText className="h-3.5 w-3.5" />Open file</a>}
          </div>
        </Card>
      ))}
    </div>
  );
}
