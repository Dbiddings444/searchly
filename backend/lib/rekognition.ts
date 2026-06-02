import { RekognitionClient } from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});