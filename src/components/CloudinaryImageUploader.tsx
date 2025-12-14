// src/components/CloudinaryImageUploader.tsx
import { useState, type ChangeEvent, type DragEvent } from "react";

type CloudinaryImageUploaderProps = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
};

export function CloudinaryImageUploader({
  label = "Imatge",
  value,
  onChange,
}: CloudinaryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  async function uploadFile(file: File) {
    if (!cloudName || !uploadPreset) {
      setError(
        "Falten les variables de Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)."
      );
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Error pujant la imatge a Cloudinary");
      }

      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error("No s'ha rebut la URL de la imatge");
      }
    } catch (err) {
      console.error(err);
      setError("No s'ha pogut pujar la imatge.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500 flex flex-col items-center justify-center gap-2"
      >
        <p className="text-center">
          Arrossega una foto aquí o{" "}
          <span className="font-semibold text-slate-900">
            clica per seleccionar
          </span>
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-xs"
        />
        {uploading && (
          <p className="text-[11px] text-slate-500 mt-1">
            Pujant imatge…
          </p>
        )}
      </div>

      {value && (
        <div className="mt-2">
          <p className="text-[11px] text-slate-500 mb-1">
            Previsualització
          </p>
          <img
            src={value}
            alt="Previsualització"
            className="w-full max-h-48 object-cover rounded-2xl border border-slate-200"
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
