import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppLogger } from '../../common/logger/logger.helper';

// Simple typing for uploaded file to avoid depending on Express.Multer global types
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint =
      this.configService.get<string>('B2_ENDPOINT') ??
      'https://s3.us-west-004.backblazeb2.com';

    const region = this.configService.get<string>('B2_REGION') ?? 'us-west-004';

    const accessKeyId = this.configService.get<string>('B2_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('B2_APPLICATION_KEY');

    this.bucketName =
      this.configService.get<string>('B2_BUCKET_NAME') ?? 'phuphiem-upload';

    const s3Config: S3ClientConfig = {
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKeyId ?? '',
        secretAccessKey: secretAccessKey ?? '',
      },
    };

    this.s3Client = new S3Client(s3Config);
  }

  async uploadFile(file: UploadedFile) {
    const key = `test-uploads/${Date.now()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Tạo pre-signed URL cho bucket private, hết hạn sau 1 giờ (3600s)
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      return {
        key,
        signedUrl,
      };
    } catch (error) {
      AppLogger.error('Upload to Backblaze B2 failed', error, 'UploadService', {
        fileName: file.originalname,
        bucketName: this.bucketName,
      });
      throw new InternalServerErrorException('Upload failed');
    }
  }
}
