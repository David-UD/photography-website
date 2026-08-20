import { encode } from "blurhash";

export interface TImageInfo {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Aspect ratio (width/height) */
  aspectRatio: number;
  /** BlurHash representation of the image */
  blurhash: string;
  /** Original image file name */
  fileName?: string;
  /** Image MIME type */
  mimeType?: string;
  /** Image file size in bytes */
  fileSize?: number;
}

const loadImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extract image metadata and blurhash from photo file
 * @param file Photo file
 * @returns Image width, height, aspect ratio, blurhash
 */
export const getImageInfo = async (file: File): Promise<TImageInfo> => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed");
  }

  try {
    const img = await loadImage(file);
    // generate blurhash
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    ctx.drawImage(img, 0, 0, 32, 32);
    const imageData = ctx.getImageData(0, 0, 32, 32);

    const blurhash = encode(
      imageData.data,
      imageData.width,
      imageData.height,
      5,
      4
    );

    if (!blurhash) {
      throw new Error("Failed to generate blurhash");
    }

    const imageInfo: TImageInfo = {
      width: img.width,
      height: img.height,
      aspectRatio: Number((img.width / img.height).toFixed(2)),
      blurhash,
    };

    // cleanup
    URL.revokeObjectURL(img.src);

    return imageInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to process image: " + String(error));
  }
};