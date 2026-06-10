"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Trash2,
  GraduationCap,
  Briefcase,
  Loader2,
  RefreshCcw,
  LogOut,
  Users,
  Clock3,
} from "lucide-react";  

import {
  getStudents,
  getInstructors,
  approveStudent,
  approveInstructor,
  deleteStudent,
  deleteInstructor,
} from "@/services/admin";

import { toast } from "sonner";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    authenticated,
    logout,
  } = useAuth();

  const [students, setStudents] =
    useState<any[]>([]);

  const [instructors, setInstructors] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        studentsRes,
        instructorsRes,
      ] = await Promise.all([
        getStudents(),
        getInstructors(),
      ]);

      setStudents(
        studentsRes.students
      );

      setInstructors(
        instructorsRes.instructors
      );
    } catch {
      toast.error(
        "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // not logged in
    if (!authenticated || !user) {
      router.replace("/");
      return;
    }

    // wrong role
    if (user.role === "student") {
      router.replace("/student");
      return;
    }

    if (user.role === "instructor") {
      router.replace("/instructor");
      return;
    }

    loadData();
  }, [
    authLoading,
    authenticated,
    user,
    router,
  ]);

  if (
    authLoading ||
    loading ||
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}

      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage students and instructors
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-4">

          <Card className="p-5">
            <Users className="h-5 w-5 mb-2" />
            <p className="text-sm text-muted-foreground">
              Students
            </p>
            <p className="text-2xl font-bold">
              {students.length}
            </p>
          </Card>

          <Card className="p-5">
            <Clock3 className="h-5 w-5 mb-2" />
            <p className="text-sm text-muted-foreground">
              Pending Students
            </p>
            <p className="text-2xl font-bold">
              {
                students.filter(
                  (s) =>
                    s.status ===
                    "pending"
                ).length
              }
            </p>
          </Card>

          <Card className="p-5">
            <Users className="h-5 w-5 mb-2" />
            <p className="text-sm text-muted-foreground">
              Instructors
            </p>
            <p className="text-2xl font-bold">
              {instructors.length}
            </p>
          </Card>

          <Card className="p-5">
            <Clock3 className="h-5 w-5 mb-2" />
            <p className="text-sm text-muted-foreground">
              Pending Instructors
            </p>
            <p className="text-2xl font-bold">
              {
                instructors.filter(
                  (i) =>
                    i.status ===
                    "pending"
                ).length
              }
            </p>
          </Card>

        </div>

        <Tabs
          defaultValue="students"
          className="space-y-6"
        >
          <TabsList>

            <TabsTrigger value="students">
              <GraduationCap className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>

            <TabsTrigger value="instructors">
              <Briefcase className="h-4 w-4 mr-2" />
              Instructors
            </TabsTrigger>

          </TabsList>

          <TabsContent value="students">
            <UsersPanel
              users={students}
              role="student"
              refresh={loadData}
            />
          </TabsContent>

          <TabsContent value="instructors">
            <UsersPanel
              users={instructors}
              role="instructor"
              refresh={loadData}
            />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

function UsersPanel({
  users,
  role,
  refresh,
}: {
  users: any[];
  role: "student" | "instructor";
  refresh: () => void;
}) {
  const [busyId, setBusyId] =
    useState("");

  const approve = async (
    id: string
  ) => {
    try {
      setBusyId(id);

      if (role === "student") {
        await approveStudent(id);
      } else {
        await approveInstructor(id);
      }

      toast.success(
        "Approved successfully"
      );

      refresh();
    } catch {
      toast.error(
        "Approval failed"
      );
    } finally {
      setBusyId("");
    }
  };

  const remove = async (
    id: string
  ) => {
    try {
      setBusyId(id);

      if (role === "student") {
        await deleteStudent(id);
      } else {
        await deleteInstructor(id);
      }

      toast.success(
        "User removed"
      );

      refresh();
    } catch {
      toast.error(
        "Unable to remove user"
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-4">
      {users.length === 0 && (
        <Card className="p-6 text-center">
          No pending {role}s
        </Card>
      )}

      {users.map((user) => (
        <Card
          key={user.id}
          className="p-5"
        >
          <div className="flex flex-col gap-4">

            <div className="flex justify-between items-start gap-4">

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  {user.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user.phone}
                </p>

                {role === "student" && (
                  <p className="text-sm text-muted-foreground">
                    {user.college || user.clg}
                    {" • "}
                    Semester{" "}
                    {user.semester || user.sem}
                  </p>
                )}

              </div>

              <div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user.status}
                </span>

              </div>
            </div>

            <div className="flex gap-2">

              {user.status ===
                "pending" && (
                <Button
                  onClick={() =>
                    approve(user.id)
                  }
                  disabled={
                    busyId === user.id
                  }
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}

              <Button
                variant="destructive"
                disabled={
                  busyId === user.id
                }
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      `Delete this ${role}? This action cannot be undone.`
                    );

                  if (confirmed) {
                    remove(user.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>

            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}