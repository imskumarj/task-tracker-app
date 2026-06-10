"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import {
  getStudentProfile,
} from "@/services/student";

import {
  getStudentTasks,
  StudentTask,
} from "@/services/task";

import {
  getStudentResources,
  StudentResource,
} from "@/services/resource";

import {
  ClipboardList,
  BookOpen,
  User,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  RefreshCcw,
  LogOut,
  ChevronDown,
  ChevronUp,
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

import SubmitTaskModal from "@/components/student/SubmitTaskModal";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/PdfViewer"),
  {
    ssr: false,
  }
);

type TaskFilter =
  | "all"
  | "assigned"
  | "submitted"
  | "resubmit"
  | "evaluated";

export default function StudentPage() {
  const router = useRouter();

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();

  const [profile, setProfile] =
    useState<any>(null);

  const [tasks, setTasks] =
    useState<StudentTask[]>([]);

  const [resources, setResources] =
    useState<StudentResource[]>([]);

  const [busy, setBusy] =
    useState(true);

  const [taskFilter, setTaskFilter] =
    useState<TaskFilter>("all");

  const [expandedTasks, setExpandedTasks] =
    useState<string[]>([]);

  const [expandedResources, setExpandedResources] =
    useState<string[]>([]);

  const toggleTask = (id: string) => {
    setExpandedTasks((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleResource = (id: string) => {
    setExpandedResources((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const loadData = async () => {
    try {
      setBusy(true);

      const results =
        await Promise.allSettled([
          getStudentProfile(),
          getStudentTasks(),
          getStudentResources(),
        ]);

      const profileRes =
        results[0].status === "fulfilled"
          ? results[0].value
          : null;

      const tasksRes =
        results[1].status === "fulfilled"
          ? results[1].value
          : null;

      const resourcesRes =
        results[2].status === "fulfilled"
          ? results[2].value
          : null;

      if (profileRes) {
        setProfile(profileRes.student);
      }

      if (tasksRes) {
        setTasks(tasksRes.tasks || []);
      }

      if (resourcesRes) {
        setResources(
          resourcesRes.resources || []
        );
      }
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
    if (loading) return;

    // not logged in
    if (!authenticated || !user) {
      router.replace("/");
      return;
    }

    // logged in but wrong role
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user.role === "instructor") {
      router.replace("/instructor");
      return;
    }
  }, [
    loading,
    authenticated,
    user,
    router,
  ]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const filteredTasks =
    useMemo(() => {
      if (taskFilter === "all")
        return tasks;

      return tasks.filter(
        (task) =>
          task.status === taskFilter
      );
    }, [tasks, taskFilter]);

  if (
    loading ||
    busy ||
    !user ||
    user.role !== "student"
  ) {
    return (
      <LoadingScreen label="Loading dashboard" />
    );
  }

  if (!user) {
    return null;
  }

  if (
    profile &&
    profile?.status?.toLowerCase() === "pending"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center">
          <Clock3 className="h-12 w-12 mx-auto text-amber-500" />

          <h1 className="mt-4 text-2xl font-bold">
            Account Approval Pending
          </h1>

          <p className="mt-3 text-muted-foreground">
            Your account is awaiting
            approval from the organisation.
            Once approved, you will gain
            access to tasks, resources,
            and submissions.
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
      {/* Header */}

      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Hello, {profile?.name ?? "Student"}
            </h1>

            <p className="text-sm text-muted-foreground">
              SUID: {profile?.suid}
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
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}

      <div className="max-w-7xl mx-auto p-6">
        <Tabs
          defaultValue="tasks"
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              My Tasks
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

              {/* Filters */}

              <div className="flex flex-wrap gap-2">

                <Button
                  size="sm"
                  variant={
                    taskFilter === "all"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setTaskFilter("all")
                  }
                >
                  All
                </Button>

                <Button
                  size="sm"
                  variant={
                    taskFilter ===
                    "assigned"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setTaskFilter(
                      "assigned"
                    )
                  }
                >
                  Pending
                </Button>

                <Button
                  size="sm"
                  variant={
                    taskFilter ===
                    "submitted"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setTaskFilter(
                      "submitted"
                    )
                  }
                >
                  Submitted
                </Button>

                <Button
                  size="sm"
                  variant={
                    taskFilter ===
                    "resubmit"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setTaskFilter(
                      "resubmit"
                    )
                  }
                >
                  Resubmission Needed
                </Button>

                <Button
                  size="sm"
                  variant={
                    taskFilter ===
                    "evaluated"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setTaskFilter(
                      "evaluated"
                    )
                  }
                >
                  Evaluated
                </Button>
              </div>

              {filteredTasks.length === 0 ? (
                <Card className="p-10 text-center">
                  <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />

                  <h3 className="mt-4 font-semibold">
                    No tasks found
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    No tasks available
                    under this filter.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredTasks.map(
                    (task) => {
                      const latestEvaluation =
                        task.evaluations?.at(-1);

                      return (
                        <Card
                          key={task.tuid}
                          className="overflow-hidden"
                        >

                          <button
                            onClick={() =>
                              toggleTask(task.tuid)
                            }
                            className="
                              w-full
                              p-5
                              flex
                              justify-between
                              items-center
                              text-left
                              hover:bg-muted/30
                              transition
                            "
                          >

                            <div>

                              <h3 className="font-semibold text-lg">
                                {task.title}
                              </h3>

                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned by{" "}
                                {
                                  task.instructor?.name
                                }
                              </p>

                            </div>

                            <div className="flex items-center gap-3">

                              {task.status ===
                                "assigned" && (
                                <Badge variant="secondary">
                                  Pending
                                </Badge>
                              )}

                              {task.status ===
                                "submitted" && (
                                <Badge>
                                  Submitted
                                </Badge>
                              )}

                              {task.status ===
                                "resubmit" && (
                                <Badge
                                  variant="outline"
                                >
                                  Resubmit
                                </Badge>
                              )}

                              {task.status ===
                                "evaluated" && (
                                <Badge>
                                  Evaluated
                                </Badge>
                              )}

                              {expandedTasks.includes(
                                task.tuid
                              ) ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}

                            </div>

                          </button>

                          {expandedTasks.includes(
                            task.tuid
                          ) && (

                            <div className="px-5 pb-5">

                              <div className="flex flex-col gap-4">

                                {task.content && (

                                  <p className="text-sm whitespace-pre-wrap">
                                    {task.content}
                                  </p>

                                )}

                                {task.document_url && (

                                  <div className="space-y-3">

                                    <p className="text-sm font-medium">
                                      Attachment
                                    </p>

                                    <PdfViewer
                                      url={
                                        task.document_url
                                      }
                                    />

                                  </div>

                                )}

                                {latestEvaluation && (

                                  <div className="border rounded-lg p-4 bg-muted/40">

                                    <div className="flex items-center gap-2 mb-2">

                                      <CheckCircle2 className="h-4 w-4 text-green-600" />

                                      <span className="font-medium">
                                        Instructor Evaluation
                                      </span>

                                    </div>

                                    <p className="text-sm whitespace-pre-wrap">
                                      {
                                        latestEvaluation.remarks
                                      }
                                    </p>

                                  </div>

                                )}

                                <div className="flex flex-wrap gap-2">

                                  {task.status ===
                                    "assigned" && (

                                    <SubmitTaskModal
                                      task={task}
                                      onSuccess={loadData}
                                    />

                                  )}

                                  {task.status ===
                                    "submitted" && (

                                    <Button disabled>
                                      Waiting for Review
                                    </Button>

                                  )}

                                  {task.status ===
                                    "resubmit" && (

                                    <SubmitTaskModal
                                      task={task}
                                      onSuccess={loadData}
                                      resubmit
                                    />

                                  )}

                                  {task.status ===
                                    "evaluated" && (

                                    <Button disabled>
                                      Completed
                                    </Button>

                                  )}

                                </div>

                              </div>

                            </div>

                          )}

                        </Card>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* RESOURCES TAB */}

          <TabsContent value="resources">
            <div className="space-y-4">

              {resources.length ===
              0 ? (
                <Card className="p-10 text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />

                  <h3 className="mt-4 font-semibold">
                    No Resources
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Your instructors
                    have not shared any
                    resources yet.
                  </p>
                </Card>
              ) : (
                resources.map(
                  (resource) => (
                    <Card
                      key={resource.ruid}
                      className="overflow-hidden"
                    >

                      <button
                        onClick={() =>
                          toggleResource(
                            resource.ruid
                          )
                        }
                        className="
                          w-full
                          p-5
                          flex
                          justify-between
                          items-center
                          text-left
                          hover:bg-muted/30
                          transition
                        "
                      >

                        <div>

                          <h3 className="font-semibold">
                            {resource.title}
                          </h3>

                          <p className="text-xs text-muted-foreground mt-1">
                            Shared by{" "}
                            {
                              resource.instructor
                                ?.name
                            }
                          </p>

                        </div>

                        {expandedResources.includes(
                          resource.ruid
                        ) ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}

                      </button>

                      {expandedResources.includes(
                        resource.ruid
                      ) && (

                        <div className="px-5 pb-5">

                          {resource.description && (

                            <p className="text-sm whitespace-pre-wrap mb-4">
                              {
                                resource.description
                              }
                            </p>

                          )}

                          {resource.document_url && (

                            <PdfViewer
                              url={
                                resource.document_url
                              }
                            />

                          )}

                        </div>

                      )}

                    </Card>
                  )
                )
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
                    Student Profile
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Read-only account information
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <p className="text-xs text-muted-foreground">
                    Student UID
                  </p>

                  <p className="font-medium">
                    {profile?.suid}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Full Name
                  </p>

                  <p className="font-medium">
                    {profile?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    College
                  </p>

                  <p className="font-medium">
                    {profile?.clg}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Semester
                  </p>

                  <p className="font-medium">
                    {profile?.sem}
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
                    Account Status
                  </p>

                  <div className="mt-1">
                    <Badge>
                      {profile?.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">

                <h3 className="font-medium mb-3">
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
                      Pending Tasks
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {
                        tasks.filter(
                          (t) =>
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
                          (t) =>
                            t.status ===
                            "submitted"
                        ).length
                      }
                    </p>
                  </Card>

                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground">
                      Evaluated
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {
                        tasks.filter(
                          (t) =>
                            t.status ===
                            "evaluated"
                        ).length
                      }
                    </p>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}