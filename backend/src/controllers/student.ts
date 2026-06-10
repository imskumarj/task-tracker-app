import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentProfile =
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

          select: {
            id: true,
            suid: true,
            name: true,
            college: true,
            semester: true,
            phone: true,
            email: true,
            status: true,
            createdAt: true,
          },
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      return res.json({
        success: true,

        student: {
          suid: student.suid,
          name: student.name,

          clg:
            student.college,

          sem:
            student.semester,

          phone:
            student.phone,

          email:
            student.email,

          status:
            student.status,

          createdAt:
            student.createdAt,
        },
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