"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Loader2 } from "lucide-react";

import { toast } from "sonner";

import {
  createTask,
  updateTask,
} from "@/services/instructor";

import { uploadTaskDocument } from "@/lib/upload";

interface TaskDialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  editing?: any;

  students: any[];

  onSuccess: () => void;
}

export default function TaskDialog({
  open,
  onOpenChange,
  editing,
  students,
  onSuccess,
}: TaskDialogProps) {
  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [assignAll, setAssignAll] =
    useState(true);

  const [
    selectedSuids,
    setSelectedSuids,
  ] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setTitle(
        editing.title || ""
      );

      setContent(
        editing.content || ""
      );

      setAssignAll(
        editing.assignAll ?? true
      );

      setSelectedSuids(
        editing.assignedStudents?.map(
          (s: any) => s.suid
        ) || []
      );
    } else {
      setTitle("");
      setContent("");
      setFile(null);
      setAssignAll(true);
      setSelectedSuids([]);
    }
  }, [open, editing]);

  const save = async () => {
    if (!title.trim()) {
      toast.error(
        "Task title is required"
      );

      return;
    }

    try {
      setBusy(true);

      let documentUrl =
        editing?.documentUrl || "";

      if (file) {
        documentUrl =
          await uploadTaskDocument(
            file
          );
      }

      const payload = {
        title,
        content,
        documentUrl,
        assignAll,
        suids: assignAll
          ? []
          : selectedSuids,
      };

      if (editing) {
        await updateTask(
          editing.tuid,
          payload
        );

        toast.success(
          "Task updated"
        );
      } else {
        await createTask(
          payload
        );

        toast.success(
          "Task created"
        );
      }

      onSuccess();

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to save task"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? "Edit Task"
              : "Create Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Task Title"
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
            placeholder="Task Description"
            className="
              w-full
              min-h-[150px]
              border
              rounded-lg
              p-3
            "
          />

          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] ||
                  null
              )
            }
          />

          {editing?.documentUrl &&
            !file && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Existing PDF
                </p>

                <a
                  href={
                    editing.documentUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    text-sm
                    text-blue-600
                    underline
                  "
                >
                  View Current File
                </a>
              </div>
            )}

          <div className="border rounded-lg p-4 space-y-4">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={assignAll}
                onChange={(e) =>
                  setAssignAll(
                    e.target.checked
                  )
                }
              />

              <span>
                Assign to all
                students
              </span>
            </label>

            {!assignAll && (
              <>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {students.map(
                    (
                      student: any
                    ) => (
                      <label
                        key={
                          student.suid
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          py-2
                        "
                      >
                        <input
                          type="checkbox"
                          checked={selectedSuids.includes(
                            student.suid
                          )}
                          onChange={(
                            e
                          ) => {
                            if (
                              e.target
                                .checked
                            ) {
                              setSelectedSuids(
                                (
                                  prev
                                ) => [
                                  ...prev,
                                  student.suid,
                                ]
                              );
                            } else {
                              setSelectedSuids(
                                (
                                  prev
                                ) =>
                                  prev.filter(
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

                        <span>
                          {
                            student.name
                          }
                          {" ("}
                          {
                            student.suid
                          }
                          {")"}
                        </span>
                      </label>
                    )
                  )}
                </div>

                {selectedSuids.length >
                  0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Selected
                      Students
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedSuids.map(
                        (
                          suid
                        ) => (
                          <Badge
                            key={
                              suid
                            }
                            variant="secondary"
                          >
                            {suid}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            className="w-full"
            onClick={save}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editing ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}