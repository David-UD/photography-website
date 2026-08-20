import { create } from "zustand";

interface ModalStore {
  isOpen: boolean;
  galleryId: string | null;
  onOpen: (galleryId?: string) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  isOpen: false,
  galleryId: null,
  onOpen: (galleryId) => set({ isOpen: true, galleryId: galleryId ?? null }),
  onClose: () => set({ isOpen: false }),
}));