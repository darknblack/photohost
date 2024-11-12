import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { blake3 } from 'hash-wasm';
import sharp from 'sharp';
import ImageManipulation from './image-manipulation';
import path from 'path';

interface ThumbnailSizes {
  small: { width: number; height: number };
}

interface ThumbnailInfo {
  hash: string;
  urls: {
    small: string;
  };
}

interface PhotoMetadata {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  hash: string;
  uploadedAt: string;
  folder: string;
  tags?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

interface PhotoRecord {
  metadata: PhotoMetadata;
  url: string;
  thumbnails: {
    small: string;
  };
}

interface PhotoMetadata {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  hash: string;
  uploadedAt: string;
  folder: string;
  tags?: string[];
}

interface PhotoRecord {
  metadata: PhotoMetadata;
  url: string;
}

interface ListPhotosOptions {
  folder?: string;
  limit?: number;
  cursor?: string;
  tags?: string[];
}

interface ListFoldersResponse {
  folders: string[];
  nextCursor?: string;
}

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg';
  } else if (ext === '.png') {
    return 'image/png';
  } else if (ext === '.gif') {
    return 'image/gif';
  }
}
class PhotoStorage {
  private client: S3Client;
  private bucket: string;
  private static readonly METADATA_PREFIX = 'metadata/';
  private static readonly CONTENT_PREFIX = 'content/';
  private static readonly FOLDER_INDEX_PREFIX = 'folders/';
  private static readonly THUMBNAIL_PREFIX = 'thumbnails/';

  constructor(accountId: string, accessKeyId: string, secretAccessKey: string, bucket: string) {
    this.bucket = bucket;
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Sanitize folder name to be URL-safe
   */
  private sanitizeFolderName(folder: string): string {
    return folder
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Calculate SHA-256 hash of file
   */
  private async calculateHash(file: Buffer): Promise<string> {
    return blake3(file);
  }

  /**
   * Check if a file with the same hash exists in a specific folder
   */
  private async findDuplicateByHash(hash: string, folder: string): Promise<string | null> {
    try {
      const objects = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: `${PhotoStorage.METADATA_PREFIX}${this.sanitizeFolderName(folder)}/`,
        })
      );

      for (const object of objects.Contents || []) {
        if (object.Key) {
          const response = await this.client.send(
            new GetObjectCommand({
              Bucket: this.bucket,
              Key: object.Key,
            })
          );

          const metadata = JSON.parse(await response.Body!.transformToString()) as PhotoMetadata;
          if (metadata.hash === hash) {
            return metadata.id;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return null;
    }
  }

  /**
   * Store photo metadata
   */
  private async storeMetadata(metadata: PhotoMetadata): Promise<void> {
    const folderPath = this.sanitizeFolderName(metadata.folder);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${PhotoStorage.METADATA_PREFIX}${folderPath}/${metadata.hash}.json`,
        Body: JSON.stringify(metadata),
        ContentType: 'application/json',
      })
    );

    // Update folder index
    await this.updateFolderIndex(metadata.folder);
  }

  /**
   * Update folder index
   */
  private async updateFolderIndex(folder: string): Promise<void> {
    const folderPath = this.sanitizeFolderName(folder);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${PhotoStorage.FOLDER_INDEX_PREFIX}${folderPath}`,
        Body: '',
        ContentType: 'application/json',
      })
    );
  }

  /**
   * Upload a photo with thumbnails
   */
  async uploadPhoto(
    file: Buffer,
    fileName: string,
    folder: string,
    options: {
      tags?: string[];
    } = {}
  ): Promise<PhotoRecord> {
    try {
      const sanitizedFolder = this.sanitizeFolderName(folder);
      const hash = await this.calculateHash(file);

      // Check for duplicates in the same folder
      const existingId = await this.findDuplicateByHash(hash, sanitizedFolder);
      if (existingId) {
        const existing = await this.getPhoto(existingId);
        console.log('Duplicate photo detected in folder, returning existing record');
        return existing;
      }

      // Generate thumbnails
      const thumbnails = await this.generateThumbnails(file);

      // Store thumbnails (this will reuse existing ones if available)
      const thumbnailInfo = await this.storeThumbnails(hash, thumbnails);

      const id = randomUUID();
      const key = `${PhotoStorage.CONTENT_PREFIX}${sanitizedFolder}/${hash}`;

      // Get image dimensions
      const dimensions = await sharp(file).metadata();
      const contentType = getContentType(fileName) || 'image/jpeg';

      // Upload the actual file
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: contentType,
        })
      );

      // Create and store metadata
      const metadata: PhotoMetadata = {
        id,
        originalName: fileName,
        contentType: contentType,
        size: file.length,
        hash,
        uploadedAt: new Date().toISOString(),
        folder: sanitizedFolder,
        tags: options.tags,
        dimensions: {
          width: dimensions.width as number,
          height: dimensions.height as number,
        },
      };

      await this.storeMetadata(metadata);

      return {
        metadata,
        url: `https://${this.bucket}.r2.cloudflarestorage.com/${key}`,
        thumbnails: {
          small: `https://${this.bucket}.r2.cloudflarestorage.com/${thumbnailInfo.urls.small}`,
        },
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a photo by ID
   */
  async getPhoto(id: string): Promise<PhotoRecord> {
    try {
      // List all folders to find the photo
      const folders = await this.listFolders();

      for (const folder of folders.folders) {
        try {
          const metadataResponse = await this.client.send(
            new GetObjectCommand({
              Bucket: this.bucket,
              Key: `${PhotoStorage.METADATA_PREFIX}${folder}/${id}.json`,
            })
          );

          const metadata = JSON.parse(await metadataResponse.Body!.transformToString()) as PhotoMetadata;

          return {
            metadata,
            url: `https://${this.bucket}.r2.cloudflarestorage.com/${PhotoStorage.CONTENT_PREFIX}${folder}/${id}`,
            thumbnails: {
              small: `https://${this.bucket}.r2.cloudflarestorage.com/${PhotoStorage.THUMBNAIL_PREFIX}/${id}`,
            },
          };
        } catch (error) {
          // Continue searching in other folders
          continue;
        }
      }

      throw new Error(`Photo with ID ${id} not found in any folder`);
    } catch (error) {
      console.error('Error getting photo:', error);
      throw new Error(`Failed to get photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a photo and its thumbnails if no other photos reference them
   */
  async deletePhoto(id: string): Promise<void> {
    try {
      const photo = await this.getPhoto(id);
      const { hash } = photo.metadata;

      // Check if other photos use the same thumbnails
      const otherPhotosUsingThumbnails = await this.listPhotos({
        limit: 2, // We only need to know if there's at least one other photo
      });

      const hasOtherReferences = otherPhotosUsingThumbnails.photos.some(
        p => p.metadata.id !== id && p.metadata.hash === hash
      );

      // Delete the photo content and metadata
      await this.deletePhoto(id);

      // If no other photos use these thumbnails, delete them
      if (!hasOtherReferences) {
        const thumbnailKeys = [`${PhotoStorage.THUMBNAIL_PREFIX}${hash}/small.jpg`];

        await Promise.all(
          thumbnailKeys.map(key =>
            this.client.send(
              new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
              })
            )
          )
        );
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error(`Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(folder: string): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${PhotoStorage.FOLDER_INDEX_PREFIX}${this.sanitizeFolderName(folder)}`,
        })
      );
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all folders
   */
  async listFolders(nextCursor?: string): Promise<ListFoldersResponse> {
    try {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: PhotoStorage.FOLDER_INDEX_PREFIX,
          Delimiter: '/',
          ContinuationToken: nextCursor,
        })
      );

      const folders = (response.Contents || [])
        .map(object => object.Key?.replace(PhotoStorage.FOLDER_INDEX_PREFIX, ''))
        .filter((folder): folder is string => !!folder);

      return {
        folders,
        nextCursor: response.NextContinuationToken,
      };
    } catch (error) {
      console.error('Error listing folders:', error);
      throw new Error('Failed to list folders');
    }
  }

  /**
   * List photos with various filtering options
   */
  async listPhotos(options: ListPhotosOptions = {}): Promise<{ photos: PhotoRecord[]; nextCursor?: string }> {
    try {
      const prefix = options.folder
        ? `${PhotoStorage.METADATA_PREFIX}${this.sanitizeFolderName(options.folder)}/`
        : PhotoStorage.METADATA_PREFIX;

      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: options.limit || 100,
          ContinuationToken: options.cursor,
        })
      );

      const photos: PhotoRecord[] = [];

      for (const object of response.Contents || []) {
        if (object.Key) {
          const metadataResponse = await this.client.send(
            new GetObjectCommand({
              Bucket: this.bucket,
              Key: object.Key,
            })
          );

          const metadata = JSON.parse(await metadataResponse.Body!.transformToString()) as PhotoMetadata;

          // Filter by tags if specified
          if (options.tags && options.tags.length > 0) {
            if (!metadata.tags || !options.tags.every(tag => metadata?.tags?.includes(tag))) {
              continue;
            }
          }

          photos.push({
            metadata,
            url: `https://${this.bucket}.r2.cloudflarestorage.com/${PhotoStorage.CONTENT_PREFIX}${metadata.folder}/${metadata.id}`,
            thumbnails: {
              small: `https://${this.bucket}.r2.cloudflarestorage.com/${PhotoStorage.THUMBNAIL_PREFIX}${metadata.hash}/small.jpg`,
            },
          });
        }
      }

      return {
        photos,
        nextCursor: response.NextContinuationToken,
      };
    } catch (error) {
      console.error('Error listing photos:', error);
      throw new Error('Failed to list photos');
    }
  }

  /**
   * Move photo to a different folder
   */
  async movePhoto(id: string, newFolder: string): Promise<PhotoRecord> {
    try {
      const photo = await this.getPhoto(id);
      const oldFolder = photo.metadata.folder;
      const sanitizedNewFolder = this.sanitizeFolderName(newFolder);

      if (oldFolder === sanitizedNewFolder) {
        return photo;
      }

      // Copy to new location
      await Promise.all([
        // Copy the content file
        this.client.send(
          new CopyObjectCommand({
            Bucket: this.bucket,
            Key: `${PhotoStorage.CONTENT_PREFIX}${sanitizedNewFolder}/${id}`,
            CopySource: `${this.bucket}/${PhotoStorage.CONTENT_PREFIX}${oldFolder}/${id}`,
          })
        ),
        // Create new metadata file
        this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: `${PhotoStorage.METADATA_PREFIX}${sanitizedNewFolder}/${id}.json`,
            Body: JSON.stringify({
              ...photo.metadata,
              folder: sanitizedNewFolder,
            }),
            ContentType: 'application/json',
          })
        ),
      ]);

      // Delete from old location
      await Promise.all([
        this.client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: `${PhotoStorage.CONTENT_PREFIX}${oldFolder}/${id}`,
          })
        ),
        this.client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: `${PhotoStorage.METADATA_PREFIX}${oldFolder}/${id}.json`,
          })
        ),
      ]);

      // Update folder indexes
      await Promise.all([this.updateFolderIndex(oldFolder), this.updateFolderIndex(sanitizedNewFolder)]);

      return this.getPhoto(id);
    } catch (error) {
      console.error('Error moving photo:', error);
      throw new Error(`Failed to move photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate thumbnails for an image
   */
  private async generateThumbnails(imageBuffer: Buffer): Promise<Record<keyof ThumbnailSizes, Buffer>> {
    const buffer = await ImageManipulation.downScale(imageBuffer);

    const thumbnails: Record<keyof ThumbnailSizes, Buffer> = {
      small: buffer,
    };

    return thumbnails;
  }

  /**
   * Check if thumbnails already exist for a given hash
   */
  private async findExistingThumbnails(hash: string): Promise<ThumbnailInfo | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: `${PhotoStorage.THUMBNAIL_PREFIX}${hash}`,
        })
      );

      if (response.$metadata.httpStatusCode === 200) {
        return {
          hash: hash,
          urls: {
            small: `${PhotoStorage.THUMBNAIL_PREFIX}${hash}/small.webp`,
          },
        };
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  /**
   * Store thumbnails and return their URLs
   */
  private async storeThumbnails(
    hash: string,
    thumbnails: Record<keyof ThumbnailSizes, Buffer>
  ): Promise<ThumbnailInfo> {
    const existingThumbnails = await this.findExistingThumbnails(hash);
    if (existingThumbnails) {
      return existingThumbnails;
    }

    const thumbnailPromises = Object.entries(thumbnails).map(([size, buffer]) => {
      return this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${PhotoStorage.THUMBNAIL_PREFIX}${hash}/${size}.webp`,
          Body: buffer,
          ContentType: 'image/webp',
        })
      );
    });

    await Promise.all(thumbnailPromises);

    const thumbnailInfo: ThumbnailInfo = {
      hash,
      urls: {
        small: `${PhotoStorage.THUMBNAIL_PREFIX}${hash}/small.webp`,
      },
    };

    return thumbnailInfo;
  }
}

// use env variables to set the bucket name
export const photoStorage = new PhotoStorage(
  'fd2d05f5befcb62cf5132c34fb9d4a47',
  '73729f3ed3ca53df931d81f9234f039d',
  'ac1566814e4660506669a63e6d949405887f295e19690917ed6737ed5a2c7f9a',
  'photohost'
);

export default photoStorage;
export { PhotoStorage };
