"use client";

import * as React from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;

  disabled?: boolean;
  maxSizeBytes?: number; // default 10MB

  /** (opcjonalnie) dodatkowa walidacja - np. w przyszłości tylko JPG */
  validateFile?: (file: File) => string | null;
};

const IMAGE_ACCEPT: Accept = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
};

export function UploadFileDialog({
  value,
  onChange,
  disabled = false,
  maxSizeBytes = 10 * 1024 * 1024,
  validateFile,
}: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!value) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    const isImage = value.type?.startsWith("image/");
    const url = isImage ? URL.createObjectURL(value) : null;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onDropAccepted = React.useCallback(
    (files: File[]) => {
      setError(null);
      const file = files[0];
      if (!file) return;

      const custom = validateFile?.(file) ?? null;
      if (custom) {
        setError(custom);
        return;
      }

      onChange(file);
    },
    [onChange, validateFile]
  );

  const onDropRejected = React.useCallback(
    (rejections: FileRejection[]) => {
      const msgs: string[] = [];

      for (const r of rejections) {
        for (const e of r.errors) {
          if (e.code === "file-too-large") {
            msgs.push(`Plik jest za duży (max ${formatBytes(maxSizeBytes)}).`);
          } else if (e.code === "file-invalid-type") {
            msgs.push("Nieobsługiwany typ pliku. Dozwolone tylko zdjęcia.");
          } else {
            msgs.push(e.message);
          }
        }
      }

      setError(dedupe(msgs).join(" "));
    },
    [maxSizeBytes]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: IMAGE_ACCEPT,
    multiple: false,
    maxSize: maxSizeBytes,
    disabled,
    noClick: true,
    onDropAccepted,
    onDropRejected,
  });

  const remove = React.useCallback(() => {
    setError(null);
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border border-dashed p-4 transition-colors",
          "bg-muted/20",
          isDragActive ? "border-[#F2542F] bg-[#F2542F]/5" : "border-border",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        {!value ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl border bg-background">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col items-center justify-center min-w-0">
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Upuść zdjęcie, aby dodać"
                  : "Przeciągnij zdjęcie tutaj"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG / JPG / JPEG / WEBP • max {formatBytes(maxSizeBytes)}
              </p>

              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  disabled={disabled}
                  className="cursor-pointer"
                >
                  Wybierz zdjęcie
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={value.name}
                  className="h-16 w-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted/20">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{value.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatBytes(value.size)}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  disabled={disabled}
                >
                  Zmień zdjęcie
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    remove();
                  }}
                  disabled={disabled}
                >
                  <X className="mr-2 h-4 w-4" />
                  Usuń
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border bg-background p-3 text-sm text-destructive">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Błąd</span>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function dedupe(arr: string[]) {
  return Array.from(new Set(arr));
}
