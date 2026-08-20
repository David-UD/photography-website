"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TImageInfo } from "@/modules/photos/lib/utils";
import { PhotoFormData, INITIAL_FORM_VALUES, STEP_CONFIG } from "./types";
import { FirstStep } from "./steps/first-step";
import { SecondStep } from "./steps/second-step";
import { FourthStep } from "./steps/fourth-step";
import { ProgressBar } from "./components/progress-bar";
import { StepIndicator } from "./components/step-indicator";
import { SuccessScreen } from "./components/success-screen";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// TYPES
// ============================================================================

interface MultiStepFormProps {
  className?: string;
  initialGalleryId?: string | null;
  onSubmit?: (data: PhotoFormData) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MultiStepForm({
  className,
  initialGalleryId,
  onSubmit,
}: MultiStepFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createPhoto = useMutation(trpc.photos.create.mutationOptions());
  const removeS3Object = useMutation(trpc.s3.deleteFile.mutationOptions());

  // ========================================
  // State Management
  // ========================================

  // Step control
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form data
  const [formData, setFormData] =
    useState<Partial<PhotoFormData>>({
      ...INITIAL_FORM_VALUES,
      galleryId: initialGalleryId ?? null,
    });

  // Upload-related state
  const [url, setUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo>();

  // ========================================
  // Handlers
  // ========================================

  // Handle upload success
  const handleUploadSuccess = (uploadedUrl: string, uploadedImageInfo: TImageInfo) => {
    setUrl(uploadedUrl);
    setImageInfo(uploadedImageInfo);
  };

  // Handle re-upload
  const handleReupload = (url: string) => {
    removeS3Object.mutate({ key: url });
    setUrl(null);
    setImageInfo(undefined);
  };

  // Handle next step
  const handleNext = (data: Partial<PhotoFormData>) => {
    const updatedData = { ...formData, ...data, url: url || "" };

    setFormData(updatedData);

    if (step < STEP_CONFIG.length - 1) {
      // Move to next step
      setStep(step + 1);
    } else {
      // Final submission
      const finalData = {
        ...updatedData,
        url: url || "",
        title: updatedData.title || "",
        description: updatedData.description || "",
        aspectRatio: imageInfo ? imageInfo.width / imageInfo.height : 1,
        width: imageInfo?.width || 0,
        height: imageInfo?.height || 0,
        blurData: imageInfo?.blurhash || "",
      };

      setIsSubmitting(true);

      // Use tRPC mutation instead of callback
      createPhoto.mutate(finalData, {
        onSuccess: async () => {
          // Invalidate queries to refetch lists
          await queryClient.invalidateQueries(
            trpc.photos.getMany.queryOptions({})
          );
          await queryClient.invalidateQueries(
            trpc.home.getManyLikePhotos.queryOptions({ limit: 10 })
          );
          await queryClient.invalidateQueries(
            trpc.home.getGalleries.queryOptions({ limit: 12 })
          );
          await queryClient.invalidateQueries(
            trpc.galleries.getMany.queryOptions()
          );
          await queryClient.invalidateQueries(
            trpc.dashboard.getDashboardStats.queryOptions()
          );

          toast.success("Photo uploaded successfully!");
          setIsComplete(true);
          setIsSubmitting(false);

          // Also call the optional callback if provided
          if (onSubmit) {
            onSubmit(finalData as PhotoFormData);
          }
        },
        onError: (error) => {
          toast.error(error.message);
          setIsSubmitting(false);
        },
      });
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Reset entire form
  const handleReset = () => {
    setStep(0);
    setFormData({
      ...INITIAL_FORM_VALUES,
      galleryId: initialGalleryId ?? null,
    });
    setIsComplete(false);
    setUrl(null);
    setImageInfo(undefined);
  };

  // ========================================
  // Animation Configuration
  // ========================================

  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // ========================================
  // Render Step Content
  // ========================================

  const renderStep = () => {
    const commonProps = {
      initialData: formData,
      isSubmitting,
      onBack: handleBack,
    };

    switch (step) {
      case 0:
        return (
          <FirstStep
            {...commonProps}
            url={url}
            imageInfo={imageInfo}
            onUploadSuccess={handleUploadSuccess}
            onReupload={handleReupload}
            onNext={handleNext}
          />
        );
      case 1:
        return <SecondStep {...commonProps} onNext={handleNext} />;
      case 2:
        return <FourthStep {...commonProps} onNext={handleNext} />;
      default:
        return null;
    }
  };

  // ========================================
  // Render
  // ========================================

  return (
    <div className={cn("mx-auto w-full", className)}>
      {!isComplete ? (
        <>
          <ProgressBar currentStep={step} totalSteps={STEP_CONFIG.length} />
          <StepIndicator steps={STEP_CONFIG} currentStep={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold">{STEP_CONFIG[step].title}</h2>
                <p className="text-muted-foreground text-sm">
                  {STEP_CONFIG[step].description}
                </p>
              </div>

              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen onReset={handleReset} />
      )}
    </div>
  );
}