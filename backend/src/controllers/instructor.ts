import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                  PROFILE                                   */
/* -------------------------------------------------------------------------- */

export const getInstructorProfile =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user =
        (req as any).user;

      const instructor =
        await prisma.instructor.findUnique(
          {
            where: {
              id: user.id,
            },

            select: {
              iuid: true,
              name: true,
              phone: true,
              email: true,
              status: true,
              createdAt: true,
            },
          }
        );

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message:
            "Instructor not found",
        });
      }

      return res.json({
        success: true,
        instructor,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch profile",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/*                                  STUDENTS                                  */
/* -------------------------------------------------------------------------- */

export const getStudents =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const students =
        await prisma.student.findMany({
          where: {
            status:
              "approved",
          },

          select: {
            suid: true,
            name: true,
            college: true,
            semester: true,
            email: true,
          },

          orderBy: {
            name: "asc",
          },
        });

      return res.json({
        success: true,
        students,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch students",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
/*                                    TASKS                                   */
/* -------------------------------------------------------------------------- */

export const createTask =
  async (
    req: Request,
    res: Response
  ) => {
    try {

        const user = (req as any).user;

        const instructor =
        await prisma.instructor.findUnique({
            where: {
            id: user.id,
            },
        });

        if (!instructor) {
        return res.status(404).json({
            success: false,
            message: "Instructor not found",
        });
        }

      const {
        title,
        content,
        documentUrl,
        assignAll,
        suids,
      } = req.body;

      let targetStudents: any[] =
        [];

      if (assignAll) {
        targetStudents =
          await prisma.student.findMany({
            where: {
              status:
                "approved",
            },

            select: {
              suid: true,
            },
          });
      } else {
        targetStudents =
          await prisma.student.findMany({
            where: {
              suid: {
                in:
                  suids ||
                  [],
              },
            },

            select: {
              suid: true,
            },
          });
      }

      const createdTasks =
        [];

      for (const student of targetStudents) {
        const task =
          await prisma.task.create({
            data: {
              tuid: `T-${Date.now()}-${Math.random()
                .toString(36)
                .substring(
                  2,
                  8
                )}`,

              iuid:
                instructor.iuid,

              suid:
                student.suid,

              title,

              content,

              documentUrl,

              status:
                "assigned",

              submissions:
                [],

              evaluations:
                [],
            },
          });

        createdTasks.push(
          task
        );
      }

      return res.json({
        success: true,
        tasks:
          createdTasks,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to create task",
      });
    }
  };

export const getInstructorTasks =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

        const instructor =
        await prisma.instructor.findUnique({
            where: {
            id: user.id,
            },
        });

        if (!instructor) {
        return res.status(404).json({
            success:false,
            message:"Instructor not found"
        });
        }

      const tasks =
        await prisma.task.findMany({
          where: {
            iuid:
              instructor.iuid,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      const grouped =
        new Map();

      for (const task of tasks) {
        const key = `${task.title}-${task.documentUrl}-${task.content}`;

        if (
          !grouped.has(
            key
          )
        ) {
          grouped.set(
            key,
            {
              tuid:
                task.tuid,

              title:
                task.title,

              content:
                task.content,

              documentUrl:
                task.documentUrl,

              status:
                task.status,

              assignAll:
                false,

              assignedStudents:
                [],

              submissions:
                [],

              evaluations:
                [],
            }
          );
        }

        const student =
          await prisma.student.findUnique(
            {
              where: {
                suid:
                  task.suid,
              },

              select: {
                suid: true,
                name: true,
              },
            }
          );

        grouped
          .get(key)
          .assignedStudents.push(
            {
              suid:
                student?.suid,

              name:
                student?.name,
            }
          );

        grouped
          .get(key)
          .submissions.push(
            ...(task.submissions as any[])
          );

        grouped
          .get(key)
          .evaluations.push(
            ...(task.evaluations as any[])
          );
      }

      return res.json({
        success: true,

        tasks:
          Array.from(
            grouped.values()
          ),
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

export const updateTask =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        title,
        content,
        documentUrl,
      } = req.body;

      const task =
        await prisma.task.update({
          where: {
            tuid:
              req.params.id as string,
          },

          data: {
            title,

            content,

            documentUrl,
          },
        });

      return res.json({
        success: true,
        task,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to update task",
      });
    }
  };

export const deleteTask =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await prisma.task.deleteMany({
        where: {
          tuid:
            req.params.id as string,
        },
      });

      return res.json({
        success: true,
        message:
          "Task deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete task",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
/*                               SUBMISSIONS                                  */
/* -------------------------------------------------------------------------- */

export const getSubmissions =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

        const instructor =
        await prisma.instructor.findUnique({
            where: {
            id: user.id,
            },
        });

        if (!instructor) {
        return res.status(404).json({
            success:false,
            message:"Instructor not found"
        });
        }

      const tasks =
        await prisma.task.findMany({
          where: {
            iuid:
              instructor.iuid,

            OR: [
              {
                status:
                  "submitted",
              },
              {
                status:
                  "evaluated",
              },
              {
                status:
                  "resubmit",
              },
            ],
          },

          orderBy: {
            updatedAt:
              "desc",
          },
        });

      const submissions =
        await Promise.all(
          tasks.map(
            async (
              task
            ) => {
              const student =
                await prisma.student.findUnique(
                  {
                    where: {
                      suid:
                        task.suid,
                    },

                    select: {
                      suid: true,
                      name: true,
                    },
                  }
                );

              return {
                tuid:
                  task.tuid,

                title:
                  task.title,

                suid:
                  student?.suid,

                studentName:
                  student?.name,

                status:
                  task.status,

                submissions:
                  task.submissions,

                evaluations:
                  task.evaluations,
              };
            }
          )
        );

      return res.json({
        success: true,
        submissions,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch submissions",
      });
    }
  };

export const evaluateSubmission =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        submitId,
        remarks,
        status,
      } = req.body;

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

      const evaluations =
        Array.isArray(
          task.evaluations
        )
          ? [
              ...(
                task.evaluations as any[]
              ),
              {
                submitid:
                  submitId,

                remarks,
              },
            ]
          : [
              {
                submitid:
                  submitId,

                remarks,
              },
            ];

      const updated =
        await prisma.task.update({
          where: {
            tuid:
              req.params.id as string,
          },

          data: {
            status,

            evaluations,
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
          "Unable to evaluate submission",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/*                                RESOURCES                                   */
/* -------------------------------------------------------------------------- */

export const getInstructorResources =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

        const instructor =
        await prisma.instructor.findUnique({
            where: {
            id: user.id,
            },
        });

        if (!instructor) {
        return res.status(404).json({
            success:false,
            message:"Instructor not found"
        });
        }

      const resources =
        await prisma.resource.findMany({
          where: {
            iuid:
              instructor.iuid,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      return res.json({
        success: true,
        resources,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch resources",
      });
    }
  };

export const createResource =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

        const instructor =
        await prisma.instructor.findUnique({
            where: {
            id: user.id,
            },
        });

        if (!instructor) {
        return res.status(404).json({
            success:false,
            message:"Instructor not found"
        });
        }

      const {
        title,
        content,
        documentUrl,
        suids,
      } = req.body;

      const resource =
        await prisma.resource.create({
          data: {
            ruid: `R-${Date.now()}-${Math.random()
              .toString(36)
              .substring(
                2,
                8
              )}`,

            iuid:
              instructor.iuid,

            title,

            content,

            documentUrl,

            suids:
              suids || [],
          },
        });

      return res.json({
        success: true,
        resource,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to create resource",
      });
    }
  };

export const deleteResource =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await prisma.resource.delete({
        where: {
          ruid:
            req.params.id as string,
        },
      });

      return res.json({
        success: true,
        message:
          "Resource deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete resource",
      });
    }
  };

