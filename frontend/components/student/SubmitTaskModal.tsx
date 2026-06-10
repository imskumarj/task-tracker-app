"use client";

import { useState } from "react";

import { toast } from "sonner";

import {
  Upload,
  Loader2,
  X,
  FileText,
} from "lucide-react";

import { submitTask } from "@/services/task";

import { uploadTaskDocument } from "@/lib/upload";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

interface SubmitTaskModalProps {
  task: {
    tuid: string;
    title: string;
  };

  onSuccess?: () => void;

  resubmit?: boolean;
}

export default function SubmitTaskModal({
  task,
  onSuccess,
  resubmit = false,
}: SubmitTaskModalProps) {
  const [open, setOpen] =
    useState(false);

  const [content, setContent] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [busy, setBusy] =
    useState(false);

  const handleSubmit = async () => {
    if (
      !content.trim() &&
      !file
    ) {
      toast.error(
        "Please provide a response or attach a document."
      );

      return;
    }

    try {
      setBusy(true);

      let documentUrl: string | undefined;

      if (file) {
        documentUrl =
          await uploadTaskDocument(
            file,
            "submissions"
          );
        }

      await submitTask(
        task.tuid,
        {
          content: content.trim(),
          documentUrl,
        }
      ); 

      toast.success(
        resubmit
          ? "Task resubmitted successfully"
          : "Task submitted successfully"
      );

      setContent("");
      setFile(null);

      setOpen(false);

      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data
          ?.message ??
          "Unable to submit task"
      );
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() =>
          setOpen(true)
        }
      >
        <Upload className="h-4 w-4 mr-2" />

        {resubmit
          ? "Resubmit Task"
          : "Submit Response"}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <div className="bg-background border rounded-xl shadow-xl w-full max-w-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div>
            <h2 className="font-semibold text-lg">
              {resubmit
                ? "Resubmit Task"
                : "Submit Task"}
            </h2>

            <p className="text-sm text-muted-foreground">
              {task.title}
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setOpen(false)
            }
            disabled={busy}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}

        <div className="p-6 space-y-5">

          <div className="space-y-2">
            <Label>
              Your Response
            </Label>

            <Textarea
              rows={8}
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              placeholder="Write your submission here..."
            />
          </div>

          <div className="space-y-2">
            <Label>
              Attach Document
              (Optional)
            </Label>

            <Input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              onChange={(e) =>
                setFile(
                  e.target
                    .files?.[0] ??
                    null
                )
              }
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg border bg-muted/40">
              <FileText className="h-4 w-4" />

              <span className="flex-1 truncate">
                {file.name}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFile(null)
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Once submitted, this
            task becomes locked until
            your instructor evaluates
            it or requests a
            resubmission.
          </p>
        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={() =>
              setOpen(false)
            }
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleSubmit
            }
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />

                {resubmit
                  ? "Resubmit"
                  : "Submit"}
              </>
            )}
          </Button>

        </div>

      </div>
    </div>
  );
}