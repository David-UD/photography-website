"use client";

import BlurImage from "@/components/blur-image";
import { cn } from "@/lib/utils";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface PhotoPreviewCardProps {
  url: string;
  title?: string;
  imageInfo: {
    width: number;
    height: number;
    blurhash: string;
  };
  className?: string;
}

export function PhotoPreviewCard({
  url,
  title,
  imageInfo,
  className,
}: PhotoPreviewCardProps) {
  // Calculate aspect ratio
  const aspectRatio = imageInfo.width / imageInfo.height;

  // Calculate container width based on aspect ratio and max height
  const widthConstraint = aspectRatio >= 1 ? "90vw" : "var(--width-constraint)";

  return (
    <div
      className={cn(
        "flex justify-center pb-14 w-full",
        aspectRatio < 1 &&
          "[--width-constraint:90vw] md:[--width-constraint:50vw]",
        className
      )}
    >
      <div
        className="bg-white relative shadow-2xl rounded-lg w-full"
        style={{
          maxWidth: `min(65vh * ${aspectRatio}, ${widthConstraint})`,
          aspectRatio: aspectRatio,
          maxHeight: "65dvh",
        }}
      >
        <BlurImage
          src={keyToUrl(url)}
          alt={title || "Photo preview"}
          width={imageInfo.width}
          height={imageInfo.height}
          blurhash={imageInfo.blurhash}
          className="w-full h-full object-cover rounded-lg"
        />

        <div className="absolute -bottom-12 left-0 px-4 sm:px-6 py-3 w-full bg-white flex justify-between items-center select-none text-gray-900 shadow-md rounded-b-lg">
          <div className="flex flex-col text-center">
            <h1
              className={cn(
                "font-semibold text-xs sm:text-sm lg:text-lg",
                aspectRatio < 1 ? "lg:text-sm" : "lg:text-lg"
              )}
            >
              {title || "Untitled photo"}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}