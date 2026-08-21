"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { ServiceFormDialog } from "../components/service-form-dialog";
import type { Service } from "@/db/schema";

export function DashboardServicesView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: services } = useSuspenseQuery(
    trpc.site.getServices.queryOptions()
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const [ConfirmDialog, confirm] = useConfirm(
    "Eliminar servicio",
    "¿Seguro que quieres eliminar este servicio?"
  );

  const removeService = useMutation(trpc.site.removeService.mutationOptions());

  const handleDelete = async (service: Service) => {
    const ok = await confirm();
    if (!ok) return;

    removeService.mutate(
      { id: service.id },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.site.getServices.queryOptions()
          );
          toast.success("Servicio eliminado");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete service");
        },
      }
    );
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los servicios mostrados en la página Sobre mí.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No hay servicios todavía. Crea el primero.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo servicio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <h2 className="font-medium">{service.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(service)}
                  title="Editar servicio"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(service)}
                  title="Eliminar servicio"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editing}
        onSaved={() => setDialogOpen(false)}
      />
      <ConfirmDialog />
    </div>
  );
}

export function DashboardServicesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
