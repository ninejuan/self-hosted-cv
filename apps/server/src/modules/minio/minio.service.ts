import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientOptions } from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly internalClient: Client;
  private readonly publicClient: Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.internalClient = new Client(
      this.createClientOptions(
        this.configService.getOrThrow<string>('MINIO_INTERNAL_ENDPOINT'),
      ),
    );
    this.publicClient = new Client(
      this.createClientOptions(
        this.configService.getOrThrow<string>('MINIO_PUBLIC_ENDPOINT'),
      ),
    );
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.internalClient.bucketExists(this.bucket);

    if (!exists) {
      await this.internalClient.makeBucket(this.bucket);
    }
  }

  async generatePresignedPutUrl(
    objectKey: string,
    contentType: string,
    expiresIn: number,
  ): Promise<string> {
    void contentType;
    return this.publicClient.presignedPutObject(
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

  getBucket(): string {
    return this.bucket;
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
}
