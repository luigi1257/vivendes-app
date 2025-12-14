// src/components/ImageUploadField.tsx
import { useCallback, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  value?: string;              // URL actual (si ja en tens una)
  onChange: (url: string) => void;  // Quan s'ha pujat una imatge nova
};

// ⚠️ posa aquí el teu cloud name i upload preset de Cloudinary
const CLOUD_NAME = "dr2nqkake";
const UPLOAD_PRESET = "vivendes_unsigned";

export function ImageUploadField({
  label,
  value,
  onChange,
}: ImageUploadFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error("Error pujant la imatge");
        }

        const data = await res.json();
        const url = data.secure_url as string;
        onChange(url);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Error pujant la imatge");
      } finally {
        setUploading(false);
        setDragOver(false);
      }
    },
    [onChange]
  );

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await handleFiles(e.target.files);
    // buidem el value de l'input per si l'usuari vol tornar a pujar la mateixa imatge
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-700">{label}</p>

      <div
        className={[
          "rounded-2xl border-2 border-dashed px-3 py-3 text-xs cursor-pointer transition",
          dragOver
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 bg-white hover:border-slate-500",
        ].join(" ")}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => {
          const input = document.getElementById(
            "image-upload-hidden-input"
          ) as HTMLInputElement | null;
          input?.click();
        }}
      >
        <div className="flex items-center gap-3">
          {/* Previsualització si hi ha imatge */}
          {value ? (
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                src={value}
                alt="Imatge"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
              📷
            </div>
          )}

          {/* Textos i estat */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[11px] text-slate-700">
              Arrossega una foto aquí o{" "}
              <span className="font-semibold underline">
                fes clic per seleccionar
              </span>
              .
            </p>
            <p className="text-[10px] text-slate-400">
              Format recomanat: JPG o PNG. Una sola imatge.
            </p>
            {uploading && (
              <p className="text-[10px] text-slate-500">
                Pujant imatge…
              </p>
            )}
            {error && (
              <p className="text-[10px] text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Input ocult per quan es fa clic */}
      <input
        id="image-upload-hidden-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
