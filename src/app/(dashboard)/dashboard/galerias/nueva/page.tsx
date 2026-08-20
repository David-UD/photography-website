import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GalleryForm } from "@/modules/galleries/ui/components/gallery-form";

export const metadata = {
  title: "New Gallery",
};

const page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard/galerias">
        <Button variant="ghost" className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to galleries
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Gallery</h1>
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <GalleryForm />
      </div>
    </div>
  );
};

export default page;