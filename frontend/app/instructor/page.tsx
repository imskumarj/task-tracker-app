import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, BookOpen, Inbox, Plus, Trash2, Edit, Loader2, FileText, Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { uploadTaskDocument } from "@/lib/upload";

export const Route = createFileRoute("/instructor")({
  head: () => ({ meta: [{ title: "Instructor — TaskBoard" }] }),
  component: InstructorPage,
});

function InstructorPage() {
  const { loading, session, profile } = useAuth();
  if (loading) return <LoadingScreen label="Verifying access" />;
  if (!session) return <Navigate to="/" />;
  if (profile?.role !== "instructor") return <Navigate to="/" />;

  if (!profile.approved) {
    return (
      <AppShell title="Pending approval" subtitle="Your instructor account is awaiting administrator review.">
        <Card className="p-10 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-full bg-warning/15 text-warning-foreground flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Awaiting approval</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Once an administrator approves your account, you'll be able to create tasks, assign them to students, and share resources.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Hello, ${profile.full_name.split(" ")[0]}`} subtitle="Manage your tasks, resources, and student submissions.">
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="h-11">
          <TabsTrigger value="tasks" className="gap-2"><ClipboardList className="h-4 w-4" />Tasks</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2"><Inbox className="h-4 w-4" />Submissions</TabsTrigger>
          <TabsTrigger value="resources" className="gap-2"><BookOpen className="h-4 w-4" />Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks"><TasksPanel /></TabsContent>
        <TabsContent value="submissions"><SubmissionsPanel /></TabsContent>
        <TabsContent value="resources"><ResourcesPanel /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function useStudents() {
  return useQuery({
    queryKey: ["instructor-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,full_name,email,college,semester").eq("role", "student").order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

function TasksPanel() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["instructor-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*, task_assignments(student_id)").eq("instructor_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Task deleted"); qc.invalidateQueries({ queryKey: ["instructor-tasks"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />New task
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 rounded-lg bg-muted animate-shimmer" />)}</div>
      ) : tasks?.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No tasks yet. Create your first one.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tasks?.map((t: any) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{t.title}</h3>
                    {t.assigned_to_all ? <Badge>All students</Badge> : <Badge variant="secondary">{t.task_assignments?.length ?? 0} assigned</Badge>}
                    {t.due_date && <Badge variant="outline">Due {new Date(t.due_date).toLocaleDateString()}</Badge>}
                  </div>
                  {t.content && <p className="mt-2 text-sm text-foreground/80">{t.content}</p>}
                  {t.document_url && <a href={t.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><FileText className="h-3.5 w-3.5" />View attachment</a>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(t); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete task?")) remove.mutate(t.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TaskDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function TaskDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: any }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: students } = useStudents();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [assignAll, setAssignAll] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title ?? "");
      setContent(editing.content ?? "");
      setDueDate(editing.due_date ? editing.due_date.slice(0, 10) : "");
      setAssignAll(editing.assigned_to_all);
      setSelected(new Set((editing.task_assignments ?? []).map((a: any) => a.student_id)));
    } else {
      setTitle(""); setContent(""); setDueDate(""); setFile(null); setAssignAll(true); setSelected(new Set());
    }
  }, [open, editing]);

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    try {
      let documentUrl = editing?.document_url ?? null;
      if (file) documentUrl = await uploadTaskDocument(file, user!.id);

      const payload = {
        instructor_id: user!.id,
        title: title.trim(),
        content: content.trim() || null,
        document_url: documentUrl,
        assigned_to_all: assignAll,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let taskId = editing?.id as string | undefined;
      if (editing) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", editing.id);
        if (error) throw error;
        // Clear existing assignments
        await supabase.from("task_assignments").delete().eq("task_id", editing.id);
      } else {
        const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
        if (error) throw error;
        taskId = data.id;
      }

      if (!assignAll && taskId && selected.size > 0) {
        const rows = Array.from(selected).map((sid) => ({ task_id: taskId!, student_id: sid }));
        const { error } = await supabase.from("task_assignments").insert(rows);
        if (error) throw error;
      }

      toast.success(editing ? "Task updated" : "Task created");
      qc.invalidateQueries({ queryKey: ["instructor-tasks"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "Create a task"}</DialogTitle>
          <DialogDescription>Assign work to students with optional document attachment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Due date (optional)</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-11" /></div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-11" /></div>
          </div>
          <div className="space-y-3 p-4 rounded-lg bg-muted/40 border">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={assignAll} onCheckedChange={(v) => setAssignAll(!!v)} />
              <span className="text-sm font-medium">Assign to all students</span>
            </label>
            {!assignAll && (
              <div className="max-h-48 overflow-y-auto space-y-1 rounded border bg-surface p-2">
                {students?.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                    <Checkbox
                      checked={selected.has(s.id)}
                      onCheckedChange={(v) => { const n = new Set(selected); if (v) n.add(s.id); else n.delete(s.id); setSelected(n); }}
                    />
                    <span className="flex-1">{s.full_name} <span className="text-muted-foreground text-xs">· {s.email}</span></span>
                  </label>
                ))}
                {students?.length === 0 && <p className="text-xs text-muted-foreground p-2">No students yet.</p>}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmissionsPanel() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-submissions", user?.id],
    queryFn: async () => {
      const { data: tasks, error: te } = await supabase.from("tasks").select("id,title").eq("instructor_id", user!.id);
      if (te) throw te;
      const taskIds = (tasks ?? []).map((t) => t.id);
      if (taskIds.length === 0) return [];
      const { data: subs, error } = await supabase
        .from("submissions")
        .select("*, tasks(title), evaluations(*), profiles!submissions_student_id_fkey(full_name,email)")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return subs;
    },
    enabled: !!user,
  });

  const evaluate = useMutation({
    mutationFn: async ({ submission_id, feedback, grade, status }: any) => {
      const { error } = await supabase.from("evaluations").upsert({
        submission_id, evaluator_id: user!.id, feedback, grade, status,
      }, { onConflict: "submission_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Evaluation saved"); qc.invalidateQueries({ queryKey: ["instructor-submissions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 rounded-lg bg-muted animate-shimmer" />)}</div>;
  if (!data || data.length === 0) {
    return <Card className="p-12 text-center"><Inbox className="h-10 w-10 mx-auto text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No submissions yet.</p></Card>;
  }

  return (
    <div className="grid gap-3">
      {data.map((s: any) => <SubmissionCard key={s.id} submission={s} onEvaluate={evaluate.mutate} />)}
    </div>
  );
}

function SubmissionCard({ submission, onEvaluate }: { submission: any; onEvaluate: (v: any) => void }) {
  const ev = submission.evaluations;
  const [feedback, setFeedback] = useState(ev?.feedback ?? "");
  const [grade, setGrade] = useState(ev?.grade ?? "");
  const [status, setStatus] = useState<"evaluated" | "needs_resubmit">(ev?.status ?? "evaluated");

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold">{submission.tasks?.title}</div>
          <div className="text-xs text-muted-foreground">
            {submission.profiles?.full_name} · attempt #{submission.attempt_number} · {new Date(submission.created_at).toLocaleString()}
          </div>
        </div>
        {ev ? (
          <Badge className={status === "needs_resubmit" ? "bg-warning/20 text-warning-foreground border-warning/40" : "bg-success/15 text-success border-success/30"}>
            {status === "needs_resubmit" ? "Needs resubmission" : "Evaluated"}
          </Badge>
        ) : <Badge variant="secondary">Pending review</Badge>}
      </div>
      {submission.content && <p className="mt-3 text-sm whitespace-pre-wrap">{submission.content}</p>}
      {submission.document_url && <a href={submission.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><FileText className="h-3.5 w-3.5" />View submission file</a>}

      <div className="mt-4 pt-4 border-t space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-xs">Grade</Label><Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. A, 85/100" className="h-10" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Outcome</Label>
            <div className="flex gap-2">
              <Button type="button" variant={status === "evaluated" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setStatus("evaluated")}>Approve</Button>
              <Button type="button" variant={status === "needs_resubmit" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setStatus("needs_resubmit")}>Resubmit</Button>
            </div>
          </div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">Feedback</Label><Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} /></div>
        <Button size="sm" onClick={() => onEvaluate({ submission_id: submission.id, feedback, grade, status })}><Check className="h-4 w-4 mr-1.5" />Save evaluation</Button>
      </div>
    </Card>
  );
}

function ResourcesPanel() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: students } = useStudents();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [assignAll, setAssignAll] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-resources", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*, resource_assignments(student_id)").eq("instructor_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("resources").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["instructor-resources"] }); },
  });

  const create = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    try {
      let documentUrl: string | null = null;
      if (file) documentUrl = await uploadTaskDocument(file, user!.id);
      const { data: r, error } = await supabase.from("resources").insert({
        instructor_id: user!.id, title: title.trim(), description: desc.trim() || null, document_url: documentUrl, assigned_to_all: assignAll,
      }).select("id").single();
      if (error) throw error;
      if (!assignAll && selected.size > 0) {
        await supabase.from("resource_assignments").insert(Array.from(selected).map((sid) => ({ resource_id: r.id, student_id: sid })));
      }
      toast.success("Resource added");
      qc.invalidateQueries({ queryKey: ["instructor-resources"] });
      setOpen(false); setTitle(""); setDesc(""); setFile(null); setAssignAll(true); setSelected(new Set());
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />New resource</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Share a resource</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
              <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-11" /></div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/40 border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={assignAll} onCheckedChange={(v) => setAssignAll(!!v)} />
                  <span className="text-sm font-medium">Share with all students</span>
                </label>
                {!assignAll && (
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded border bg-surface p-2">
                    {students?.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                        <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => { const n = new Set(selected); if (v) n.add(s.id); else n.delete(s.id); setSelected(n); }} />
                        <span>{s.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-shimmer" />)}</div>
      ) : data?.length === 0 ? (
        <Card className="p-12 text-center"><BookOpen className="h-10 w-10 mx-auto text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No resources yet.</p></Card>
      ) : (
        <div className="grid gap-3">
          {data?.map((r: any) => (
            <Card key={r.id} className="p-4 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{r.title}</h4>
                  {r.assigned_to_all ? <Badge>All</Badge> : <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{r.resource_assignments?.length ?? 0}</Badge>}
                </div>
                {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
                {r.document_url && <a href={r.document_url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><FileText className="h-3.5 w-3.5" />Open file</a>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete resource?")) remove.mutate(r.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
