"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Trash2,
  GraduationCap,
  Briefcase,
  Loader2,
} from "lucide-react";

import {
  getPendingStudents,
  getPendingInstructors,
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

export default function AdminPage() {
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
        getPendingStudents(),
        getPendingInstructors(),
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
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
          className="p-4 flex items-center gap-4"
        >
          <div className="flex-1">
            <div className="font-medium">
              {user.name}
            </div>

            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>

            <div className="text-sm text-muted-foreground">
              {user.phone}
            </div>

            {role === "student" && (
              <div className="text-sm text-muted-foreground">
                {user.college}
                {" • "}
                Semester{" "}
                {user.semester}
              </div>
            )}
          </div>

          <Button
            onClick={() =>
              approve(user.id)
            }
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              const confirmed = window.confirm(
                `Reject this ${role}? This will permanently delete the account.`
              );

              if (confirmed) {
                remove(user.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </Card>
      ))}
    </div>
  );
}