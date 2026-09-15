import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientOptions } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly internalClient: Client;
  private readonly presignClient: Client;
  private readonly bucket: string;
  private readonly publicEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.publicEndpoint = this.configService.getOrThrow<string>(
      'MINIO_PUBLIC_ENDPOINT',
    );
    this.internalClient = new Client(
      this.createClientOptions(
        this.configService.getOrThrow<string>('MINIO_INTERNAL_ENDPOINT'),
      ),
    );
    this.presignClient = new Client(this.createPresignClientOptions());
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.internalClient.bucketExists(this.bucket);

    if (!exists) {
      await this.internalClient.makeBucket(this.bucket);
    }

    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    });

    await this.internalClient.setBucketPolicy(this.bucket, policy);
  }

  async generatePresignedPutUrl(
    objectKey: string,
    contentType: string,
    expiresIn: number,
  ): Promise<string> {
    void contentType;
    return this.presignClient.presignedPutObject(
      this.bucket,
      objectKey,
      expiresIn,
    );
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.internalClient.removeObject(this.bucket, objectKey);
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.internalClient.statObject(this.bucket, objectKey);
      return true;
    } catch {
      return false;
    }
  }

  async getObject(objectKey: string): Promise<Buffer> {
    const stream = await this.internalClient.getObject(this.bucket, objectKey);
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }

    return Buffer.concat(chunks);
  }

  async statObjectSize(objectKey: string): Promise<number> {
    const stat = await this.internalClient.statObject(this.bucket, objectKey);
    return stat.size;
  }

  getBucket(): string {
    return this.bucket;
  }

  getPublicUrl(objectKey: string): string {
    const publicEndpoint = this.configService.getOrThrow<string>(
      'MINIO_PUBLIC_ENDPOINT',
    );

    return `${publicEndpoint}/${this.bucket}/${objectKey}`;
  }

  private createClientOptions(endpoint: string): ClientOptions {
    const url = new URL(endpoint);

    return {
      endPoint: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      useSSL: url.protocol === 'https:',
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      pathStyle: true,
    };
  }

  private createPresignClientOptions(): ClientOptions {
    const url = new URL(this.publicEndpoint);

    return {
      endPoint: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      useSSL: url.protocol === 'https:',
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      pathStyle: true,
      region: 'us-east-1',
    };
  }
}
