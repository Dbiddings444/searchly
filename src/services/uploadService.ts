import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {s3Client} from "../lib/s3";
import { v4 as uuidv4} from "uuid";

export const generateUploadUrl = async (
    fileName: string, 
    fileType: string
) => {
const key = `image/${uuidv4()} - ${fileName}`;

const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
});

const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

return { uploadUrl, key };
} 