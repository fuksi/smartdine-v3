import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface UploadConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export class ImageUploader {
  private s3Client: S3Client;
  private bucket: string;
  private cdnUrl: string;

  constructor(config: UploadConfig) {
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for DigitalOcean Spaces
    });
    this.bucket = config.bucket;
    this.cdnUrl = config.endpoint.replace(
      "https://",
      `https://${config.bucket}.`
    );
  }

  async downloadAndUploadImage(
    sourceUrl: string,
    fileName: string
  ): Promise<string> {
    try {
      console.log(`Downloading image from: ${sourceUrl}`);

      // Download the image
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine content type from the response or URL
      const contentType = response.headers.get("content-type") || "image/jpeg";

      // Upload to DigitalOcean Spaces
      const key = `products/${fileName}`;
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read", // Make the image publicly accessible
      });

      await this.s3Client.send(uploadCommand);

      const uploadedUrl = `${this.cdnUrl}/${key}`;
      console.log(`✓ Uploaded image: ${uploadedUrl}`);

      return uploadedUrl;
    } catch (error) {
      console.error(`Failed to upload image ${fileName}:`, error);
      throw error;
    }
  }

  generateFileName(originalUrl: string, productId: string): string {
    // Extract file extension from URL or default to jpg
    const urlParts = originalUrl.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const extension = lastPart.includes(".")
      ? lastPart.split(".").pop()
      : "jpg";

    // Create a clean filename
    return `${productId}.${extension}`;
  }
}

// Factory function to create ImageUploader with environment variables
export function createImageUploader(): ImageUploader | null {
  const config = {
    endpoint: process.env.DO_SPACES_ENDPOINT || "",
    region: process.env.DO_SPACES_REGION || "fra1",
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || "",
    bucket: process.env.DO_SPACES_BUCKET || "",
  };

  // Check if all required environment variables are set
  if (
    !config.endpoint ||
    !config.accessKeyId ||
    !config.secretAccessKey ||
    !config.bucket
  ) {
    console.warn(
      "DigitalOcean Spaces configuration missing. Image uploads will be skipped."
    );
    return null;
  }

  return new ImageUploader(config);
}
