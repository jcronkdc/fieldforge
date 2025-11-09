import { useState } from "react";
import clsx from "clsx";
import { supabaseClient } from "../../lib/supabaseClient";

interface AvatarUploaderProps {
  userId: string;
  value: { key: string | null; url: string | null };
  onChange: (value: { key: string | null; url: string | null }) => void;
  disabled?: boolean;
  label?: string;
}

export function AvatarUploader({ userId, value, onChange, disabled, label }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = value.url ?? null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploading) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      onChange({ key: filePath, url: publicUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleClear = () => {
    onChange({ key: null, url: null });
  };

  return (
    <div className="space-y-3">
      {label ? <div className="text-sm font-medium text-slate-200">{label}</div> : null}
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            "flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-800/70 bg-black/40",
            previewUrl ? "border-aurora/40" : "border-dashed"
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs uppercase tracking-wide text-slate-500">No avatar</span>
          )}
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-400">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-aurora hover:text-aurora-100">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || uploading}
            />
            <span>{uploading ? "Uploading…" : previewUrl ? "Replace avatar" : "Upload avatar"}</span>
          </label>
          {previewUrl ? (
            <button
              type="button"
              className="text-left text-xs text-rose-300 hover:text-rose-200"
              onClick={handleClear}
              disabled={disabled || uploading}
            >
              Remove avatar
            </button>
          ) : null}
          <p className="text-[11px] text-slate-500">PNG or JPEG up to 2MB. Stored securely via Supabase.</p>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}


