import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {s3Client} from "../lib/s3";
import { v4 as uuidv4} from "uuid";

export const generateUploadUrl = async (
    fileName: string,
    fileType: string
) => {
  console.log("[generateUploadUrl] fileName:", fileName);
  console.log("[generateUploadUrl] fileType:", fileType);
  const key = `image/${uuidv4()}-${fileName}`;
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  console.log("[generateUploadUrl] bucket:", bucket);
  console.log("[generateUploadUrl] region:", region);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const url = region === 'us-east-1'
      ? `https://${bucket}.s3.amazonaws.com/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    console.log("[generateUploadUrl] uploadUrl:", uploadUrl);
    console.log("[generateUploadUrl] url:", url);
    return { uploadUrl, key, url };
  } catch (err) {
    console.error("[generateUploadUrl] Error generating signed URL:", err);
    throw err;
  }
}