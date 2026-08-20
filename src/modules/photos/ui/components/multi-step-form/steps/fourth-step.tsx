import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import { fourthStepSchema, FourthStepData, StepProps } from "../types";
import { PhotoPreviewCard } from "../../photo-preview-card";

export function FourthStep({
  onNext,
  onBack,
  initialData,
  isSubmitting,
}: StepProps) {
  const form = useForm<FourthStepData>({
    resolver: zodResolver(fourthStepSchema),
    defaultValues: {},
    mode: "onChange",
  });

  const { handleSubmit, formState } = form;
  const { isValid } = formState;

  const onSubmit = (data: FourthStepData) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Preview */}
        {initialData?.url && initialData?.imageInfo && (
          <PhotoPreviewCard
            url={initialData.url}
            title={initialData.title}
            imageInfo={initialData.imageInfo}
            className="w-full"
          />
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}