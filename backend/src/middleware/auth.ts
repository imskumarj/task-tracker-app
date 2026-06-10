import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  verifyToken,
} from "../utils/jwt";

export const authenticate =
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Unauthorized",
          });
      }

      const token =
        authHeader.split(" ")[1];

      const payload =
        verifyToken(token);

      (req as any).user = payload;

      next();
    } catch {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Invalid token",
        });
    }
  };

export const requireAdmin =
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      (req as any).user?.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Admin access required",
        });
    }

    next();
  };

export const requireStudent =
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      (req as any).user?.role !== "student"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Student access required",
        });
    }

    next();
  };

export const requireInstructor =
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      (req as any).user?.role !==
      "instructor"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Instructor access required",
        });
    }

    next();
  };