import "dotenv/config";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "../lib/s3";

const run = async () => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: "test.jpg",
    ContentType: "image/jpeg",
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 60,
  });

  console.log("Signed URL:");
  console.log(url);
};

run();