import { z } from "zod";
import { TImageInfo } from "@/modules/photos/lib/utils";

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const firstStepSchema = z.object({
  url: z
    .string()
    .min(1, { message: "Please upload a photo before proceeding" }),
});

export type FirstStepData = z.infer<typeof firstStepSchema>;

export const secondStepSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["private", "public"]).default("public"),
  isFavorite: z.boolean().default(false),
  galleryId: z.string().uuid({ message: "Please select a gallery" }),
});

export type SecondStepData = z.infer<typeof secondStepSchema>;

export const thirdStepSchema = z.object({});

export type ThirdStepData = z.infer<typeof thirdStepSchema>;

export const fourthStepSchema = z.object({});

export type FourthStepData = z.infer<typeof fourthStepSchema>;

// Combined schema for type inference (exported for use in components)
export const formSchema = z.object({
  ...firstStepSchema.shape,
  ...secondStepSchema.shape,
  ...thirdStepSchema.shape,
  ...fourthStepSchema.shape,
  imageInfo: z.custom<TImageInfo>().optional(),
});

export type PhotoFormData = z.infer<typeof formSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface StepProps {
  onNext: (data: Partial<PhotoFormData>) => void;
  onBack?: () => void;
  initialData?: Partial<PhotoFormData>;
  isSubmitting?: boolean;
}

export interface UploadStepProps extends StepProps {
  url: string | null;
  imageInfo: TImageInfo | undefined;
  onUploadSuccess: (url: string, imageInfo: TImageInfo) => void;
  onReupload: (url: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const INITIAL_FORM_VALUES: Partial<PhotoFormData> = {
  url: "",
  title: "",
  description: "",
  visibility: "public",
  isFavorite: false,
  galleryId: null,
};

export const STEP_CONFIG = [
  {
    id: "upload",
    title: "Upload",
    description: "Upload your photo",
  },
  {
    id: "details",
    title: "Details",
    description: "Add details to your photo",
  },
  {
    id: "preview",
    title: "Preview",
    description: "Preview your photo",
  },
];