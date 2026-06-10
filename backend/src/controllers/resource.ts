import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentResources =
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

      const resources =
        await prisma.resource.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

      const visibleResources =
        resources.filter(
          (resource) =>
            !resource.suids ||
            resource.suids.length === 0 ||
            resource.suids.includes(
              student.suid
            )
        );

      const formatted =
        await Promise.all(
          visibleResources.map(
            async (
              resource
            ) => {
              const instructor =
                await prisma.instructor.findUnique(
                  {
                    where: {
                      iuid:
                        resource.iuid,
                    },

                    select: {
                      iuid: true,
                      name: true,
                    },
                  }
                );

              return {
                ruid:
                  resource.ruid,

                title:
                  resource.title,

                description:
                  resource.content,

                document_url:
                  resource.documentUrl,

                created_at:
                  resource.createdAt,

                instructor,
              };
            }
          )
        );

      return res.json({
        success: true,
        resources:
          formatted,
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


export const getResourceById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const resource =
        await prisma.resource.findUnique({
          where: {
            ruid:
              req.params.ruid as string,
          },
        });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message:
            "Resource not found",
        });
      }

      const instructor =
        await prisma.instructor.findUnique(
          {
            where: {
              iuid:
                resource.iuid,
            },

            select: {
              iuid: true,
              name: true,
            },
          }
        );

      return res.json({
        success: true,

        resource: {
          ruid:
            resource.ruid,

          title:
            resource.title,

          description:
            resource.content,

          document_url:
            resource.documentUrl,

          created_at:
            resource.createdAt,

          instructor,
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch resource",
      });
    }
  };
  