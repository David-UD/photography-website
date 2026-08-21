"use client";

import { useRef, useState } from "react";
import { usePhotoUpload } from "@/modules/photos/hooks/use-photo-upload";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImagePlus, Trash2 } from "lucide-react";
import { siteImageUrl } from "@/modules/site/lib/site-image-url";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  label: string;
  value: string | null;
  fallback: string;
  folder: string;
  onChange: (key: string | null) => void;
}

export function ImageField({
  label,
  value,
  fallback,
  folder,
  onChange,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isUploading, handleUpload } = usePhotoUpload({
    folder,
    onUploadSuccess: (key) => {
      onChange(key);
      setPreview(null);
    },
  });

  const handleFile = (file?: File) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    void handleUpload(file);
  };

  const displayUrl = preview ?? siteImageUrl(value, fallback);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative aspect-video w-48 overflow-hidden rounded-lg border bg-muted",
            isUploading && "opacity-50",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Spinner />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-1 h-4 w-4" />
            {value ? "Change" : "Upload"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                onChange(null);
                setPreview(null);
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
