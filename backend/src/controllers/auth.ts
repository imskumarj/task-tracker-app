import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import {
  generateOtp,
} from "../utils/otp";

import {
  hashPassword,
  comparePassword,
} from "../utils/password";

import {
  generateToken,
} from "../utils/jwt";

import {
  sendMail,
} from "../utils/mail";

const prisma =
  new PrismaClient();

const generateUid = async (
  type: "student" | "instructor"
): Promise<string> => {
  while (true) {
    const uid = Math.floor(
      10000 + Math.random() * 90000
    ).toString();

    const exists =
      type === "student"
        ? await prisma.student.findUnique({
            where: { suid: uid },
          })
        : await prisma.instructor.findUnique({
            where: { iuid: uid },
          });

    if (!exists) {
      return uid;
    }
  }
};

export const sendRegisterOtp =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { email } =
        req.body;

    const student =
    await prisma.student.findUnique({
        where: { email },
    });

    const instructor =
    await prisma.instructor.findUnique({
        where: { email },
    });

    const admin =
    await prisma.admin.findUnique({
        where: { email },
    });

    if (
    student ||
    instructor ||
    admin
    ) {
    return res.status(400).json({
        success: false,
        message:
        "Email already registered",
    });
    }

      const otp =
        generateOtp();

      await prisma.registerOtp.upsert({
        where: { email },

        update: {
          otp,
          verified: false,
          expiresAt:
            new Date(
              Date.now() +
                10 * 60 * 1000
            ),
        },

        create: {
          email,
          otp,
          verified: false,
          expiresAt:
            new Date(
              Date.now() +
                10 * 60 * 1000
            ),
        },
      });

      await sendMail(
        email,
        "TaskBoard OTP Verification",
        `<h2>Your OTP is ${otp}</h2>`
      );

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error("SEND OTP ERROR:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

export const verifyRegisterOtp =
  async (
    req: Request,
    res: Response
  ) => {
    const {
      email,
      otp,
    } = req.body;

    const record =
      await prisma.registerOtp.findUnique({
        where: { email },
      });

    if (
      !record ||
      record.otp !== otp
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP",
      });
    }

    if (
      record.expiresAt <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP expired",
      });
    }

    await prisma.registerOtp.update({
        where: { email },

        data: {
            verified: true,
        },
    });

        return res.json({
        success: true,
    });
  };

export const register =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        role,
        name,
        email,
        phone,
        password,
        college,
        semester,
      } = req.body;

      const hashedPassword =
        await hashPassword(
          password
        );

    const existingStudent =
    await prisma.student.findUnique({
        where: { email },
    });

    const existingInstructor =
    await prisma.instructor.findUnique({
        where: { email },
    });

    const existingAdmin =
    await prisma.admin.findUnique({
        where: { email },
    });

    if (!email) {
      return res.status(400).json({
        success:false,
        message:"Email required"
      });
    }

    if (
    existingStudent ||
    existingInstructor ||
    existingAdmin
    ) {
    return res.status(400).json({
        success: false,
        message:
        "Email already registered",
    });
    }

    const otpRecord =
        await prisma.registerOtp.findUnique({
            where: { email },
        });

        if (
        !otpRecord ||
        !otpRecord.verified
        ) {
        return res.status(400).json({
            success: false,
            message:
            "Email not verified",
        });
        }

    if (
        role !== "student" &&
        role !== "instructor"
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid role",
        });
        }

      if (
        role === "student"
      ) {
        const student =
          await prisma.student.create(
            {
              data: {
                suid: await generateUid("student"),

                name,
                email,
                phone,

                college,
                semester,

                password:
                  hashedPassword,

                status:
                  "pending",
              },
            }
          );

        await prisma.registerOtp.delete({
            where: { email },
        });

        return res.json({
          success: true,
          student,
        });
      }

      const instructor =
        await prisma.instructor.create(
          {
            data: {
              iuid: await generateUid("instructor"),

              name,
              email,
              phone,

              password:
                hashedPassword,

              status:
                "pending",
            },
          }
        );

    await prisma.registerOtp.delete({
        where: { email },
        });

      return res.json({
        success: true,
        instructor,
      });
    } catch (error) {
      console.error("REGISTER OTP ERROR:", error);

      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : error,
      });
    }
  };

export const login =
  async (
    req: Request,
    res: Response
  ) => {
    const {
      email,
      password,
    } = req.body;

    const admin =
      await prisma.admin.findUnique(
        {
          where: { email },
        }
      );

    if (admin) {
      const valid =
        await comparePassword(
          password,
          admin.password
        );

      if (!valid)
        return res.status(400).json({
          success: false,
          message:
            "Invalid credentials",
        });

      const token =
        generateToken({
          id: admin.id,
          role: "admin",
        });

      return res.json({
        success: true,
        token,
        user: {
          ...admin,
          role: "admin",
        },
      });
    }

    const instructor =
      await prisma.instructor.findUnique(
        {
          where: { email },
        }
      );

    if (instructor) {
      const valid =
        await comparePassword(
          password,
          instructor.password
        );

      if (!valid)
        return res.status(400).json({
          success: false,
          message:
            "Invalid credentials",
        });

      if (
        instructor.status !==
        "approved"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Account awaiting approval",
        });
      }

      const token =
        generateToken({
          id: instructor.id,
          role:
            "instructor",
        });

      return res.json({
        success: true,
        token,
        user: {
          ...instructor,
          role:
            "instructor",
        },
      });
    }

    const student =
      await prisma.student.findUnique(
        {
          where: { email },
        }
      );

    if (!student) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    if (
      student.status !==
      "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Account awaiting approval",
      });
    }

    const valid =
      await comparePassword(
        password,
        student.password
      );

    if (!valid)
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials",
      });

    const token =
      generateToken({
        id: student.id,
        role: "student",
      });

    return res.json({
      success: true,
      token,
      user: {
        ...student,
        role: "student",
      },
    });
  };

export const sendForgotOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    const student =
      await prisma.student.findUnique({
        where: { email },
      });

    const instructor =
      await prisma.instructor.findUnique({
        where: { email },
      });

    if (!student && !instructor) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const otp = generateOtp();

    await prisma.forgotOtp.upsert({
      where: { email },

      update: {
        otp,
        expiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },

      create: {
        email,
        otp,
        expiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
    });

    await sendMail(
      email,
      "TaskBoard Password Reset OTP",
      `<h2>Your OTP is ${otp}</h2>`
    );

    return res.json({
      success: true,
      message: "OTP sent",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      otp,
      password,
    } = req.body;

    const record =
      await prisma.forgotOtp.findUnique({
        where: { email },
      });

    if (
      !record ||
      record.otp !== otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      record.expiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword =
      await hashPassword(password);

    const student =
      await prisma.student.findUnique({
        where: { email },
      });

    if (student) {
      await prisma.student.update({
        where: {
          id: student.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    const instructor =
      await prisma.instructor.findUnique({
        where: { email },
      });

    if (instructor) {
      await prisma.instructor.update({
        where: {
          id: instructor.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    await prisma.forgotOtp.delete({
      where: { email },
    });

    return res.json({
      success: true,
      message:
        "Password updated successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    });
  }
};

export const getCurrentUser =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
        });
      }

      if (user.role === "admin") {
        const admin =
          await prisma.admin.findUnique({
            where: {
              id: user.id,
            },
          });

        return res.json(admin);
      }

      if (
        user.role === "instructor"
      ) {
        const instructor =
          await prisma.instructor.findUnique(
            {
              where: {
                id: user.id,
              },
            }
          );

        return res.json({
          ...instructor,
          role: "instructor",
        });
      }

      const student =
        await prisma.student.findUnique(
          {
            where: {
              id: user.id,
            },
          }
        );

      return res.json({
        ...student,
        role: "student",
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };

export const logout =
  async (
    req: Request,
    res: Response
  ) => {
    return res.json({
      success: true,
      message:
        "Logged out successfully",
    });
  };