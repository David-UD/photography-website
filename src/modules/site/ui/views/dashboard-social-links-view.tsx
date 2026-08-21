"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SocialLinkRow {
  title: string;
  url: string;
  primary: boolean;
  position: number;
}

const toRows = (
  links: { title: string; url: string; primary: boolean; position: number }[],
): SocialLinkRow[] => {
  const rows = links.map((link) => ({
    title: link.title,
    url: link.url,
    primary: link.primary,
    position: link.position,
  }));
  // Ensure exactly 4 rows (pad with empty ones if the DB is missing any).
  while (rows.length < 4) {
    rows.push({ title: "", url: "", primary: false, position: rows.length + 1 });
  }
  return rows.slice(0, 4);
};

export function DashboardSocialLinksView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: profile } = useSuspenseQuery(
    trpc.site.getProfile.queryOptions()
  );

  const [links, setLinks] = useState<SocialLinkRow[]>(() =>
    toRows(profile.socialLinks)
  );

  const updateSocialLinks = useMutation(
    trpc.site.updateSocialLinks.mutationOptions()
  );

  const updateRow = (position: number, patch: Partial<SocialLinkRow>) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.position === position ? { ...link, ...patch } : link
      )
    );
  };

  const handleSave = () => {
    const invalid = links.filter((link) => !link.title.trim() || !link.url.trim());
    if (invalid.length > 0) {
      toast.error("Todos los enlaces deben tener título y URL");
      return;
    }

    updateSocialLinks.mutate(
      { links },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.site.getProfile.queryOptions()
          );
          toast.success("Redes sociales actualizadas");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update social links");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Redes sociales</h1>
        <p className="text-sm text-muted-foreground">
          Exactamente 4 enlaces configurables. El enlace marcado como principal
          recibe el estilo destacado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enlaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {links.map((link) => (
            <div
              key={link.position}
              className="grid gap-4 rounded-lg border p-4 md:grid-cols-[auto_1fr_1fr_auto] md:items-end"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {link.position}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">Título</p>
                <Input
                  value={link.title}
                  placeholder="Instagram"
                  onChange={(e) => updateRow(link.position, { title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">URL</p>
                <Input
                  value={link.url}
                  placeholder="https://instagram.com/..."
                  onChange={(e) => updateRow(link.position, { url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={link.primary}
                  onCheckedChange={(checked) =>
                    updateRow(link.position, { primary: checked })
                  }
                />
                <span className="text-xs text-muted-foreground">Principal</span>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateSocialLinks.isPending}
            >
              {updateSocialLinks.isPending ? "Guardando..." : "Guardar enlaces"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
