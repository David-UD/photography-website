"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/db/schema";

const serviceFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSaved: () => void;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSaved,
}: ServiceFormDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createService = useMutation(trpc.site.createService.mutationOptions());
  const updateService = useMutation(trpc.site.updateService.mutationOptions());

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: service?.title ?? "",
        description: service?.description ?? "",
      });
    }
  }, [open, service, form]);

  const handleSave = (values: ServiceFormValues) => {
    const onSuccess = async () => {
      await queryClient.invalidateQueries(trpc.site.getServices.queryOptions());
      toast.success(service ? "Servicio actualizado" : "Servicio creado");
      onSaved();
    };
    const onError = (error: { message?: string }) => {
      toast.error(error.message || "Failed to save service");
    };

    if (service) {
      updateService.mutate({ id: service.id, ...values }, { onSuccess, onError });
    } else {
      createService.mutate(values, { onSuccess, onError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          <DialogDescription>
            Administra un servicio mostrado en la página Sobre mí.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Fotografía de bodas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="resize-none"
                      placeholder="Descripción del servicio..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createService.isPending || updateService.isPending}
              >
                {createService.isPending || updateService.isPending
                  ? "Guardando..."
                  : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
