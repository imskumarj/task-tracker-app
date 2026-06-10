import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  Request,
  Response,
} from "express";

import { v4 as uuid }
from "uuid";

import { s3 }
from "../config/s3";

import { env }
from "../config/env";

export const uploadFile =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const file =
        req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message:
            "No file uploaded",
        });
      }

      const category =
        (
          req.body
            ?.category ||
          "misc"
        ).toLowerCase();

      const year =
        new Date()
          .getFullYear();

      const month =
        String(
          new Date()
            .getMonth() +
            1
        ).padStart(
          2,
          "0"
        );

      const ext =
        file.originalname
          .split(".")
          .pop();

      const key =
        `${category}/${year}/${month}/${Date.now()}-${uuid()}.${ext}`;

      await s3.send(
        new PutObjectCommand({
          Bucket:
            env.AWS_BUCKET_NAME,

          Key: key,

          Body:
            file.buffer,

          ContentType:
            file.mimetype,
        })
      );

      const url =
        `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      return res.json({
        success: true,
        url,
      });

    } catch (error) {

      console.error(error);

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Upload failed",
        });
    }
  };