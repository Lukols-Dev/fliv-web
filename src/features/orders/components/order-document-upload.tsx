"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { UploadFileDialog } from "@/components/custom/upload-file-dialog";
import { useTranslations } from "next-intl";

export type OrderImageDraft = {
  file: File;
  title: string;
};

type Props = {
  trigger: React.ReactNode;
  onAdd: (draft: OrderImageDraft) => void;
};

export function OrderDocumentUploadDialog({ trigger, onAdd }: Props) {
  const t = useTranslations("UploadFileDialog");
  const [open, setOpen] = React.useState(false);

  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) return;
    const name = file.name ?? "";
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    setTitle((prev) => (prev.trim().length ? prev : base));
  }, [file]);

  const close = React.useCallback(() => {
    setOpen(false);
    setFile(null);
    setTitle("");
    setError(null);
  }, []);

  const handleAdd = React.useCallback(() => {
    setError(null);

    if (!file) {
      setError(t("errors.fileRequired"));
      return;
    }
    if (!title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }

    onAdd({ file, title: title.trim() });
    close();
  }, [file, title, onAdd, close, t]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFile(null);
          setTitle("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="max-w-2xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>

        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-semibold tracking-tight">
              {t("title")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={close}
            className="h-10 w-10 rounded-xl"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <div className="px-6 py-6 space-y-4">
          <UploadFileDialog value={file} onChange={setFile} />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("fields.title")}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("fields.titlePlaceholder")}
            />
          </div>

          {error ? (
            <div className="rounded-xl border bg-background p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="px-6 py-5 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            {t("actions.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            className="bg-[#F2542F] hover:bg-[#F2542F]/90"
          >
            {t("actions.confirmOne")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
