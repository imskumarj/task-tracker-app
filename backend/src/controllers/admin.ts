import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const students =
      await prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json({
      success: true,
      students,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch students",
    });
  }
};

export const getInstructors =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const instructors =
        await prisma.instructor.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json({
        success: true,
        instructors,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch instructors",
      });
    }
  };
  
export const getPendingStudents =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const students =
        await prisma.student.findMany({
          where: {
            status: "pending",
          },
          orderBy: {
            createdAt: "desc",
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

export const getPendingInstructors =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const instructors =
        await prisma.instructor.findMany({
          where: {
            status: "pending",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json({
        success: true,
        instructors,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch instructors",
      });
    }
  };

export const approveStudent =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id as string;

      const student =
        await prisma.student.update({
          where: { id },

          data: {
            status: "approved",
          },
        });

      return res.json({
        success: true,
        message:
          "Student approved",
        student,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to approve student",
      });
    }
  };

export const approveInstructor =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id as string;

      const instructor =
        await prisma.instructor.update({
          where: { id },

          data: {
            status: "approved",
          },
        });

      return res.json({
        success: true,
        message:
          "Instructor approved",
        instructor,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to approve instructor",
      });
    }
  };

export const deleteStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const student =
      await prisma.student.findUnique({
        where: { id },
        select: {
          suid: true,
        },
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await prisma.$transaction(
      async (tx) => {
        const resources =
          await tx.resource.findMany({
            where: {
              suids: {
                has: student.suid,
              },
            },
          });

        for (const resource of resources) {
          const remainingSuids =
            resource.suids.filter(
              (suid) =>
                suid !== student.suid
            );

          if (
            remainingSuids.length === 0
          ) {
            await tx.resource.delete({
              where: {
                ruid: resource.ruid,
              },
            });
          } else {
            await tx.resource.update({
              where: {
                ruid: resource.ruid,
              },
              data: {
                suids:
                  remainingSuids,
              },
            });
          }
        }

        await tx.student.delete({
          where: { id },
        });
      }
    );

    return res.json({
      success: true,
      message: "Student removed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove student",
    });
  }
};

export const deleteInstructor = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const instructor =
      await prisma.instructor.findUnique({
        where: { id },
        select: {
          iuid: true,
        },
      });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.task.deleteMany({
          where: {
            iuid: instructor.iuid,
          },
        });

        await tx.resource.deleteMany({
          where: {
            iuid: instructor.iuid,
          },
        });

        await tx.instructor.delete({
          where: { id },
        });
      }
    );

    return res.json({
      success: true,
      message: "Instructor removed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove instructor",
    });
  }
};

export const getApprovedStudents =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const students =
        await prisma.student.findMany({
          where: {
            status: "approved",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json({
        success: true,
        students,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };

export const getApprovedInstructors =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const instructors =
        await prisma.instructor.findMany({
          where: {
            status: "approved",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json({
        success: true,
        instructors,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };