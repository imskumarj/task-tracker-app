import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                             GET STUDENT TASKS                              */
/* -------------------------------------------------------------------------- */

export const getStudentTasks =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user =
        (req as any).user;

      const student =
        await prisma.student.findUnique({
          where: {
            id: user.id,
          },
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      const tasks =
        await prisma.task.findMany({
          where: {
            suid:
              student.suid,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      const formatted =
        await Promise.all(
          tasks.map(
            async (
              task
            ) => {
              const instructor =
                await prisma.instructor.findUnique(
                  {
                    where: {
                      iuid:
                        task.iuid,
                    },

                    select: {
                      iuid: true,
                      name: true,
                    },
                  }
                );

              return {
                tuid:
                  task.tuid,

                title:
                  task.title,

                content:
                  task.content,

                document_url:
                  task.documentUrl,

                status:
                  task.status,

                submissions:
                  task.submissions,

                evaluations:
                  task.evaluations,

                instructor,
              };
            }
          )
        );

      return res.json({
        success: true,
        tasks:
          formatted,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch tasks",
      });
    }
  };

export const submitTask =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user =
        (req as any).user;

      const student =
        await prisma.student.findUnique({
          where: {
            id: user.id,
          },
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      const task =
        await prisma.task.findUnique({
          where: {
            tuid:
              req.params.id as string,
          },
        });

      if (!task) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found",
        });
      }

      const {
        content,
        documentUrl,
      } = req.body;

      const submissions =
        Array.isArray(
          task.submissions
        )
          ? [
              ...(
                task.submissions as any[]
              ),
              {
                submitid: `S-${Date.now()}`,

                content,

                documentUrl,

                submittedAt:
                  new Date(),

                suid:
                  student.suid,
              },
            ]
          : [
              {
                submitid: `S-${Date.now()}`,

                content,

                documentUrl,

                submittedAt:
                  new Date(),

                suid:
                  student.suid,
              },
            ];

      const updated =
        await prisma.task.update({
          where: {
            tuid:
              req.params.id as string,
          },

          data: {
            status:
              "submitted",

            submissions,
          },
        });

      return res.json({
        success: true,
        task: updated,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit task",
      });
    }
  };

