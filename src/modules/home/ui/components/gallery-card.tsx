"use client";

import Link from "next/link";
import BlurImage from "@/components/blur-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import VectorTopLeftAnimation from "./vector-top-left-animation";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

type CoverPhoto = {
  url: string;
  title: string;
  blurData: string;
} | null;

interface Props {
  title: string;
  slug: string;
  coverPhoto: CoverPhoto;
  photoCount: number;
}

const GalleryCard = ({ title, slug, coverPhoto, photoCount }: Props) => {
  return (
    <Link href={`/galerias/${slug}`} className="block">
      <div className="w-full relative group cursor-pointer">
        <AspectRatio
          ratio={0.75 / 1}
          className="overflow-hidden rounded-lg relative"
        >
          {coverPhoto ? (
            <BlurImage
              src={keyToUrl(coverPhoto.url)}
              alt={coverPhoto.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1535px) 50vw, 33vw"
              quality={65}
              className="object-cover lg:group-hover:blur-xs lg:transition-[filter] lg:duration-300 lg:ease-out"
              blurhash={coverPhoto.blurData}
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </AspectRatio>

        <div className="absolute top-0 left-0 z-20">
          <VectorTopLeftAnimation title={title} />
        </div>
        <div className="absolute bottom-2 right-2 z-20 bg-background/70 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs font-light">
          {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;