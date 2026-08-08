import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

const EXPIRES_IN_DEFAULT = 3600;

const client = new S3Client({
  region: "us-east-1",
  maxAttempts: 1,
});

async function getSignedUrlForS3(
  params: PutObjectCommandInput,
): Promise<string> {
  try {
    if (!params?.Bucket || !params?.Key) {
      throw "Bucket and Key are required to get signed URL for S3";
    }
    const command = new PutObjectCommand(params);
    return await getSignedUrl(client, command, {
      expiresIn: EXPIRES_IN_DEFAULT,
    });
  } catch (error) {
    throw error;
  }
}

export default { getSignedUrlForS3 };
