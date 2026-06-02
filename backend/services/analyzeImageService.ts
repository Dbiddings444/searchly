import { DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";
import { rekognition } from "../lib/rekognition";

dotenv.config({ path: "../.env" });

export const analyzeImage = async (s3Key: string) => {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }

  const command = new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: s3Key,
      },
    },
    MaxLabels: 5,
    MinConfidence: 70,
  });

  try {
    const response = await rekognition.send(command);
    const labels = response.Labels ?? [];

    console.log("[analyzeImage] Detected labels:", labels);
    const names = labels.map((l) => l.Name).filter((n): n is string => !!n);
    return names;
  } catch (err) {
    console.error("[analyzeImage] Rekognition error:", err);
    throw err;
  }
};