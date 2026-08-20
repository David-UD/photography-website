"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import MultiStepForm from "./multi-step-form";
import { useModal } from "@/hooks/use-modal";

const CreatePhotoModal = () => {
  const { isOpen, onClose, galleryId } = useModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Create Photo"
      className="sm:max-w-3xl"
      dismissible={false}
    >
      <MultiStepForm initialGalleryId={galleryId} />
    </ResponsiveModal>
  );
};

export default CreatePhotoModal;