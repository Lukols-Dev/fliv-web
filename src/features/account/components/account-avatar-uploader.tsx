"use client";

import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Props = {
  fullName: string;
  initials: string;
  avatarUrl?: string | null;
  disabled?: boolean;
  onUpload: (file: File) => Promise<string>;
};

function isAllowedAvatar(file: File): boolean {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  return allowed.includes(file.type);
}

export function AccountAvatarUploader({
  fullName,
  initials,
  avatarUrl,
  disabled,
  onUpload,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [localUrl, setLocalUrl] = useState<string | null>(avatarUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setLocalUrl(avatarUrl ?? null);
  }, [avatarUrl]);

  const handlePick = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!isAllowedAvatar(file)) {
      console.log("Invalid file type. Allowed: jpg, png, webp.");
      return;
    }

    const previous = localUrl;
    const preview = URL.createObjectURL(file);
    setLocalUrl(preview);
    setIsUploading(true);

    try {
      const newUrl = await onUpload(file);
      setLocalUrl(newUrl);
    } catch (err) {
      console.log(err);
      setLocalUrl(previous);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="relative h-16 w-16">
      <Avatar className="h-16 w-16">
        {localUrl ? <AvatarImage src={localUrl} alt={fullName} /> : null}
        <AvatarFallback className="text-base">{initials}</AvatarFallback>
      </Avatar>

      {/* overlay */}
      <button
        type="button"
        onClick={handlePick}
        disabled={disabled || isUploading}
        className={cn(
          "absolute inset-0 grid place-items-center rounded-full transition-opacity cursor-pointer",
          "bg-black/40 opacity-0 hover:opacity-100",
          (disabled || isUploading) && "cursor-not-allowed opacity-0"
        )}
        aria-label="Edit avatar"
      >
        {isUploading ? (
          <Spinner className="h-5 w-5 text-white" />
        ) : (
          <Pencil className="h-5 w-5 text-white" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
