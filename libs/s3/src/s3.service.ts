import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private bucketName: string;
  private s3: S3Client;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME!;
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(key, buffer, contentType) {
    if (!key || !buffer)
      throw new BadRequestException('key and buffer is required');

    try {
      const command = new PutObjectCommand({
        Key: key,
        Bucket: this.bucketName,
        Body: buffer,
        ContentType: contentType,
      });
      await this.s3.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new BadRequestException('failed to upload image');
    }
  }

  async deleteFile(key) {
    try {
      if (!key) throw new BadRequestException('key is required');
      const command = new DeleteObjectCommand({
        Key: key,
        Bucket: this.bucketName,
      });
      await this.s3.send(command);
    } catch {
      throw new BadRequestException('failed to delete image');
    }
  }
}
