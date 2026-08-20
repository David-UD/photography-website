"use client";

import Link from "next/link";
import BlurImage from "@/components/blur-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

type CoverPhoto = {
  url: string;
  title: string;
  blurData: string;
} | null;

interface Props {
  title: string;
  slug: string;
  description?: string | null;
  coverPhoto: CoverPhoto;
  photoCount: number;
}

const GalleryCard = ({
  title,
  slug,
  description,
  coverPhoto,
  photoCount,
}: Props) => {
  return (
    <Link href={`/galerias/${slug}`} className="block group">
      <div className="w-full relative overflow-hidden rounded-lg border bg-card">
        <AspectRatio ratio={0.75 / 1} className="overflow-hidden relative">
          {coverPhoto ? (
            <BlurImage
              src={keyToUrl(coverPhoto.url)}
              alt={coverPhoto.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1535px) 50vw, 33vw"
              quality={65}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              blurhash={coverPhoto.blurData}
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </AspectRatio>
        <div className="p-4">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <p className="mt-2 text-xs font-light text-muted-foreground">
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;