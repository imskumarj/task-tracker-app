"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import {
  getInstructorProfile,
  getInstructorTasks,
  getInstructorResources,
  getSubmissions,
  getStudents,
  deleteTask,
  deleteResource,
} from "@/services/instructor";

import {
  ClipboardList,
  BookOpen,
  Inbox,
  User,
  RefreshCcw,
  LogOut,
  Loader2,
  Clock3,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { LoadingScreen } from "@/components/common/LoadingScreen";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/PdfViewer"),
  {
    ssr: false,
  }
);

import { Trash2, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  createResource,
  evaluateSubmission,
} from "@/services/instructor";

import { uploadTaskDocument } from "@/lib/upload";

import TaskDialog from "@/components/TaskDialog";

export default function InstructorPage() {
  const router = useRouter();

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();

  const [profile, setProfile] =
    useState<any>(null);

  const [students, setStudents] =
    useState<any[]>([]);

  const [tasks, setTasks] =
    useState<any[]>([]);

  const [resources, setResources] =
    useState<any[]>([]);

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [busy, setBusy] =
    useState(true);

  const [taskModalOpen, setTaskModalOpen] =
    useState(false);

  const [
    resourceModalOpen,
    setResourceModalOpen,
  ] = useState(false);

  const [editingTask, setEditingTask] =
    useState<any>(null);

  const loadData = async () => {
    try {
      setBusy(true);

      const [
        profileRes,
        studentsRes,
        tasksRes,
        resourcesRes,
        submissionsRes,
      ] = await Promise.all([
        getInstructorProfile(),
        getStudents(),
        getInstructorTasks(),
        getInstructorResources(),
        getSubmissions(),
      ]);

      setProfile(profileRes.instructor);

      setStudents(
        studentsRes.students || []
      );

      setTasks(
        tasksRes.tasks || []
      );

      setResources(
        resourcesRes.resources || []
      );

      setSubmissions(
        submissionsRes.submissions || []
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Unable to load dashboard"
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (
      !loading &&
      !authenticated
    ) {
      router.replace("/");
    }
  }, [
    loading,
    authenticated,
    router,
  ]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  if (loading || busy) {
    return (
      <LoadingScreen label="Loading instructor dashboard" />
    );
  }

  if (!user) {
    return null;
  }

  if (
    profile &&
    profile.status === "pending"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center">

          <Clock3 className="h-12 w-12 mx-auto text-amber-500" />

          <h1 className="mt-4 text-2xl font-bold">
            Approval Pending
          </h1>

          <p className="mt-3 text-muted-foreground">
            Your instructor account
            is awaiting approval from
            an administrator.
          </p>

          <Button
            variant="outline"
            className="mt-6"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}

      <div className="border-b">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              Hello,{" "}
              {profile?.name ??
                "Instructor"}
            </h1>

            <p className="text-sm text-muted-foreground">
              IUID:
              {" "}
              {profile?.iuid}
            </p>

          </div>

          <div className="flex gap-2">

            <Button
              variant="outline"
              onClick={loadData}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        <Tabs
          defaultValue="tasks"
          className="space-y-6"
        >

          <TabsList>

            <TabsTrigger value="tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>

            <TabsTrigger value="submissions">
              <Inbox className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>

            <TabsTrigger value="resources">
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>

            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>

          </TabsList>
                    {/* TASKS TAB */}

          <TabsContent value="tasks">

            <div className="space-y-5">

              <div className="flex justify-end">

                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>

              </div>

              {tasks.length === 0 ? (

                <Card className="p-10 text-center">

                  <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />

                  <h3 className="mt-4 font-semibold">
                    No Tasks Yet
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first task.
                  </p>

                </Card>

              ) : (

                <div className="grid gap-4">

                  {tasks.map((task) => {

                    const assignedStudents =
                      task.assignedStudents || [];

                    return (

                      <Card
                        key={task.tuid}
                        className="p-5"
                      >

                        <div className="flex flex-col gap-4">

                          {/* HEADER */}

                          <div className="flex justify-between gap-4 flex-wrap">

                            <div>

                              <h3 className="font-semibold text-lg">
                                {task.title}
                              </h3>

                              <div className="flex flex-wrap gap-2 mt-2">

                                <Badge
                                  variant="outline"
                                >
                                  {task.status}
                                </Badge>

                                {task.assignAll ? (

                                  <Badge>
                                    All Students
                                  </Badge>

                                ) : (

                                  <Badge variant="secondary">
                                    {
                                      assignedStudents.length
                                    }{" "}
                                    Students
                                  </Badge>

                                )}

                              </div>

                            </div>

                            <div className="flex gap-2">

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(
                                    task
                                  );

                                  setTaskModalOpen(
                                    true
                                  );
                                }}
                              >
                                Edit
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  const confirmed =
                                    window.confirm(
                                      "Delete task permanently?"
                                    );

                                  if (
                                    !confirmed
                                  )
                                    return;

                                  try {
                                    await deleteTask(
                                      task.tuid
                                    );

                                    toast.success(
                                      "Task deleted"
                                    );

                                    loadData();
                                  } catch {
                                    toast.error(
                                      "Unable to delete task"
                                    );
                                  }
                                }}
                              >
                                Delete
                              </Button>

                            </div>

                          </div>

                          {/* DESCRIPTION */}

                          {task.content && (

                            <p className="text-sm whitespace-pre-wrap">
                              {task.content}
                            </p>

                          )}

                          {/* ASSIGNED STUDENTS */}

                          {!task.assignAll &&
                            assignedStudents.length >
                              0 && (

                              <div>

                                <p className="text-xs text-muted-foreground mb-2">
                                  Assigned To
                                </p>

                                <div className="flex flex-wrap gap-2">

                                  {assignedStudents.map(
                                    (
                                      student: any
                                    ) => (
                                      <Badge
                                        key={
                                          student.suid
                                        }
                                        variant="secondary"
                                      >
                                        {
                                          student.suid
                                        }
                                        {" - "}
                                        {
                                          student.name
                                        }
                                      </Badge>
                                    )
                                  )}

                                </div>

                              </div>

                            )}

                          {/* PDF */}

                          {task.documentUrl && (

                            <div className="space-y-3">

                              <p className="text-sm font-medium">
                                Attachment
                              </p>

                              <PdfViewer
                                url={
                                  task.documentUrl
                                }
                              />

                            </div>

                          )}

                          {/* COUNTS */}

                          <div className="grid md:grid-cols-3 gap-3">

                            <Card className="p-4">

                              <p className="text-xs text-muted-foreground">
                                Submissions
                              </p>

                              <p className="text-2xl font-bold">
                                {
                                  task.submissions
                                    ?.length
                                }
                              </p>

                            </Card>

                            <Card className="p-4">

                              <p className="text-xs text-muted-foreground">
                                Evaluations
                              </p>

                              <p className="text-2xl font-bold">
                                {
                                  task.evaluations
                                    ?.length
                                }
                              </p>

                            </Card>

                            <Card className="p-4">

                              <p className="text-xs text-muted-foreground">
                                Status
                              </p>

                              <p className="text-lg font-semibold capitalize">
                                {
                                  task.status
                                }
                              </p>

                            </Card>

                          </div>

                        </div>

                      </Card>

                    );
                  })}

                </div>

              )}

              <TaskDialog
                open={taskModalOpen}
                onOpenChange={
                  setTaskModalOpen
                }
                editing={editingTask}
                students={students}
                onSuccess={loadData}
              />

            </div>

          </TabsContent>
                    {/* SUBMISSIONS TAB */}

          <TabsContent value="submissions">

            <div className="space-y-4">

              {submissions.length === 0 ? (

                <Card className="p-10 text-center">

                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />

                  <h3 className="mt-4 font-semibold">
                    No Submissions Yet
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Student submissions will appear here.
                  </p>

                </Card>

              ) : (

                submissions.map(
                  (submission) => {

                    const latestSubmission =
                      submission.submissions?.at(-1);

                    const latestEvaluation =
                      submission.evaluations?.at(-1);

                    return (

                      <SubmissionCard
                        key={submission.tuid}
                        submission={submission}
                        latestSubmission={
                          latestSubmission
                        }
                        latestEvaluation={
                          latestEvaluation
                        }
                        onRefresh={
                          loadData
                        }
                      />

                    );
                  }
                )

              )}

            </div>

          </TabsContent>
                    {/* RESOURCES TAB */}

          <TabsContent value="resources">

            <div className="space-y-4">

              <div className="flex justify-end">

                <Button
                  onClick={() =>
                    setResourceModalOpen(true)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Resource
                </Button>

              </div>

              {resources.length === 0 ? (

                <Card className="p-10 text-center">

                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />

                  <h3 className="mt-4 font-semibold">
                    No Resources
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Create resources for your students.
                  </p>

                </Card>

              ) : (

                <div className="grid gap-4">

                  {resources.map(
                    (resource) => (

                      <Card
                        key={resource.ruid}
                        className="p-5"
                      >

                        <div className="flex justify-between gap-4">

                          <div className="flex-1">

                            <h3 className="font-semibold">
                              {resource.title}
                            </h3>

                            {resource.content && (

                              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                {resource.content}
                              </p>

                            )}

                            <div className="mt-3">

                              {resource.suids?.length ? (

                                <div className="flex flex-wrap gap-2">

                                  {resource.suids.map(
                                    (
                                      suid: string
                                    ) => (

                                      <Badge
                                        key={suid}
                                        variant="secondary"
                                      >
                                        {suid}
                                      </Badge>

                                    )
                                  )}

                                </div>

                              ) : (

                                <Badge>
                                  All Students
                                </Badge>

                              )}

                            </div>

                            {resource.documentUrl && (

                              <div className="mt-4">

                                <PdfViewer
                                  url={
                                    resource.documentUrl
                                  }
                                />

                              </div>

                            )}

                          </div>

                          <Button
                            variant="destructive"
                            onClick={async () => {

                              if (
                                !confirm(
                                  "Delete resource?"
                                )
                              )
                                return;

                              try {

                                await deleteResource(
                                  resource.ruid
                                );

                                toast.success(
                                  "Resource deleted"
                                );

                                loadData();

                              } catch {

                                toast.error(
                                  "Unable to delete resource"
                                );

                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>

                      </Card>

                    )
                  )}

                </div>

              )}

            </div>

          </TabsContent>

          {/* PROFILE TAB */}

          <TabsContent value="profile">

            <Card className="p-6">

              <div className="flex items-center gap-3 mb-6">

                <User className="h-6 w-6" />

                <div>

                  <h2 className="font-semibold text-lg">
                    Instructor Profile
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Read only profile information
                  </p>

                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <div>

                  <p className="text-xs text-muted-foreground">
                    Instructor UID
                  </p>

                  <p className="font-medium">
                    {profile?.iuid}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">
                    Name
                  </p>

                  <p className="font-medium">
                    {profile?.name}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">
                    Email
                  </p>

                  <p className="font-medium">
                    {profile?.email}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>

                  <p className="font-medium">
                    {profile?.phone}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">
                    Status
                  </p>

                  <Badge>
                    {profile?.status}
                  </Badge>

                </div>

              </div>

              <div className="mt-8 pt-6 border-t">

                <h3 className="font-medium mb-4">
                  Dashboard Statistics
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <Card className="p-4">

                    <p className="text-xs text-muted-foreground">
                      Total Tasks
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {tasks.length}
                    </p>

                  </Card>

                  <Card className="p-4">

                    <p className="text-xs text-muted-foreground">
                      Assigned
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {
                        tasks.filter(
                          (
                            t
                          ) =>
                            t.status ===
                            "assigned"
                        ).length
                      }
                    </p>

                  </Card>

                  <Card className="p-4">

                    <p className="text-xs text-muted-foreground">
                      Submitted
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {
                        tasks.filter(
                          (
                            t
                          ) =>
                            t.status ===
                            "submitted"
                        ).length
                      }
                    </p>

                  </Card>

                  <Card className="p-4">

                    <p className="text-xs text-muted-foreground">
                      Resources
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {resources.length}
                    </p>

                  </Card>

                </div>

              </div>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

      <CreateResourceDialog
        open={resourceModalOpen}
        onOpenChange={
          setResourceModalOpen
        }
        students={students}
        onSuccess={loadData}
      />

    </div>
  );
}

function SubmissionCard({
  submission,
  latestSubmission,
  latestEvaluation,
  onRefresh,
}: {
  submission: any;
  latestSubmission: any;
  latestEvaluation: any;
  onRefresh: () => void;
}) {

  const [remarks, setRemarks] =
    useState(
      latestEvaluation?.remarks ??
        ""
    );

  const [busy, setBusy] =
    useState(false);

  const evaluate = async (
    status:
      | "evaluated"
      | "resubmit"
  ) => {
    try {
      setBusy(true);

      await evaluateSubmission(
        submission.tuid,
        {
          submitId:
            latestSubmission?.submitid,
          remarks,
          status,
        }
      );

      toast.success(
        status ===
          "evaluated"
          ? "Submission evaluated"
          : "Marked for resubmission"
      );

      onRefresh();
    } catch {
      toast.error(
        "Unable to save evaluation"
      );
    } finally {
      setBusy(false);
    }
  };

  return (

    <Card className="p-5">

      <div className="space-y-4">

        {/* HEADER */}

        <div className="flex justify-between gap-3 flex-wrap">

          <div>

            <h3 className="font-semibold">
              {submission.title}
            </h3>

            <p className="text-xs text-muted-foreground">

              Student:

              {" "}

              {
                submission.studentName
              }

              {" • "}

              {
                submission.suid
              }

            </p>

          </div>

          <div>

            {submission.status ===
              "submitted" && (

              <Badge>
                Awaiting Review
              </Badge>

            )}

            {submission.status ===
              "evaluated" && (

              <Badge>
                Evaluated
              </Badge>

            )}

            {submission.status ===
              "resubmit" && (

              <Badge
                variant="outline"
              >
                Resubmit
              </Badge>

            )}

          </div>

        </div>

        {/* STUDENT TEXT */}

        {latestSubmission
          ?.content && (

          <div>

            <p className="text-sm font-medium mb-2">
              Submission Text
            </p>

            <div className="border rounded-lg p-4 bg-muted/30">

              <p className="text-sm whitespace-pre-wrap">
                {
                  latestSubmission.content
                }
              </p>

            </div>

          </div>

        )}

        {/* PDF */}

        {latestSubmission
          ?.documentUrl && (

          <div>

            <p className="text-sm font-medium mb-2">
              Submitted PDF
            </p>

            <PdfViewer
              url={
                latestSubmission.documentUrl
              }
            />

          </div>

        )}

        {/* OLD EVALUATION */}

        {latestEvaluation && (

          <div className="border rounded-lg p-4 bg-muted/40">

            <p className="font-medium mb-2">
              Previous Evaluation
            </p>

            <p className="text-sm">
              {
                latestEvaluation.remarks
              }
            </p>

          </div>

        )}

        {/* REMARKS */}

        <div>

          <label className="text-sm font-medium">
            Remarks
          </label>

          <textarea
            value={remarks}
            onChange={(e) =>
              setRemarks(
                e.target.value
              )
            }
            className="
              mt-2
              w-full
              border
              rounded-lg
              p-3
              min-h-[120px]
            "
          />

        </div>

        {/* ACTIONS */}

        <div className="flex gap-3 flex-wrap">

          <Button
            disabled={busy}
            onClick={() =>
              evaluate(
                "evaluated"
              )
            }
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Evaluate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              evaluate(
                "resubmit"
              )
            }
          >
            Request Resubmission
          </Button>

        </div>

      </div>

    </Card>

  );
}

function CreateResourceDialog({
  open,
  onOpenChange,
  students,
  onSuccess,
}: any) {

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [selectedSuids, setSelectedSuids] =
    useState<string[]>([]);

  const [busy, setBusy] =
    useState(false);

  const save = async () => {

    try {

      setBusy(true);

      let documentUrl = "";

      if (file) {
        documentUrl =
          await uploadTaskDocument(
            file
          );
      }

      await createResource({
        title,
        content,
        documentUrl,
        suids:
          selectedSuids,
      });

      toast.success(
        "Resource created"
      );

      onSuccess();

      onOpenChange(false);

    } catch {

      toast.error(
        "Unable to create resource"
      );

    } finally {

      setBusy(false);

    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">

        <DialogHeader>

          <DialogTitle>
            Create Resource
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <textarea
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-lg
              p-3
              min-h-[120px]
            "
          />

          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] ??
                  null
              )
            }
          />

          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">

            {students.map(
              (
                student: any
              ) => (

                <label
                  key={
                    student.suid
                  }
                  className="flex gap-2 py-2"
                >

                  <input
                    type="checkbox"
                    checked={selectedSuids.includes(
                      student.suid
                    )}
                    onChange={(e) => {

                      if (
                        e.target.checked
                      ) {

                        setSelectedSuids(
                          [
                            ...selectedSuids,
                            student.suid,
                          ]
                        );

                      } else {

                        setSelectedSuids(
                          selectedSuids.filter(
                            (
                              s
                            ) =>
                              s !==
                              student.suid
                          )
                        );

                      }
                    }}
                  />

                  {student.name}
                  {" ("}
                  {
                    student.suid
                  }
                  {")"}

                </label>

              )
            )}

          </div>

          <Button
            onClick={save}
            disabled={busy}
          >

            {busy ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              "Create Resource"

            )}

          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}