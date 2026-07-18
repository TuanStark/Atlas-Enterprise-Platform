import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export const FILE_STORAGE_PROVIDER = 'FILE_STORAGE_PROVIDER';

export interface UploadResult {
  url: string;
  publicId: string;
  size: number;
  provider: 'cloudinary' | 'local';
}

export interface FileStorageProvider {
  upload(file: Express.Multer.File): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}

@Injectable()
export class LocalStorageProvider implements FileStorageProvider {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created local uploads directory at: ${this.uploadDir}`);
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const fileId = randomUUID();
    const filePath = join(this.uploadDir, fileId);

    // Save to disk
    writeFileSync(filePath, file.buffer);

    return {
      url: `/files/${fileId}/view`,
      publicId: fileId,
      size: file.size,
      provider: 'local',
    };
  }

  async delete(publicId: string): Promise<void> {
    const filePath = join(this.uploadDir, publicId);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}

@Injectable()
export class CloudinaryStorageProvider implements FileStorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.logger.log('Initialized Cloudinary Storage Provider.');
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const ext = extname(file.originalname).toLowerCase().replace('.', '');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
    const resourceType = isImage ? 'image' : isVideo ? 'video' : 'raw';

    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'erp_platform',
          resource_type: resourceType,
          public_id: `${randomUUID()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary returned empty upload result'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes || file.size,
            provider: 'cloudinary',
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async delete(publicId: string): Promise<void> {
    const isImage = !publicId.includes('.'); // Cloudinary raw files normally have their extensions in the public ID
    const resourceType = isImage ? 'image' : 'raw';
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
