import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';
import { Upload } from "@aws-sdk/lib-storage";
import AppError from "./AppError";
import { createReadStream } from "fs";
// import * as fs from "fs";
// import * as path from "path";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

const bucketName = process.env.S3_BUCKET_NAME!;

export async function fileUploader(
    fileKey: string,
    files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
): Promise<string[]> {

    const filesData = files as { [fieldname: string]: Express.Multer.File[] };

    if (!filesData || !filesData[fileKey]) {
        throw new AppError("No files", 401);
    }

    const uploads = filesData[fileKey].map(async (file) => {
        const fileContent = createReadStream(file.path);
        const uuid = crypto.randomUUID();

        const key = `${fileKey}/${Date.now()}-${uuid}`;

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: fileContent,
                ContentType: file.mimetype || "application/octet-stream",
            },
        });

        await upload.done();

        return key;
    });

    return Promise.all(uploads);
}

export async function generatePresignedUrl(
    key: string
): Promise<string> {
    const bucketName = process.env.AWS_BUCKET_NAME!;

    const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const presignedUrl = await getSignedUrl(
        s3Client,
        getCommand,
        {
            expiresIn: 3600
        }
    );

    return presignedUrl;
}