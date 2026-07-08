import { useState } from "react";
import { Eye, X } from "lucide-react";

/**
 * File preview button + modal.
 * Supports images (inline) and PDFs (iframe).
 * Uses object URLs — no server storage needed.
 */
export function FilePreviewButton({ file }: { file: File }) {
  const [open, setOpen] = useState(false);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  if (!isImage && !isPdf) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="size-7 rounded-md hover:bg-accent grid place-items-center cursor-pointer"
        title="Preview"
      >
        <Eye className="size-3.5 text-muted-foreground" />
      </button>

      {open && <FilePreviewModal file={file} onClose={() => setOpen(false)} />}
    </>
  );
}

function FilePreviewModal({ file, onClose }: { file: File; onClose: () => void }) {
  const url = URL.createObjectURL(file);
  const isImage = file.type.startsWith("image/");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="text-sm font-medium truncate">{file.name}</div>
          <button
            onClick={onClose}
            className="size-8 rounded-md hover:bg-accent grid place-items-center cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2 bg-muted/30">
          {isImage ? (
            <img
              src={url}
              alt={file.name}
              className="max-w-full max-h-[75vh] mx-auto rounded object-contain"
              onLoad={() => URL.revokeObjectURL(url)}
            />
          ) : (
            <iframe
              src={url}
              title={file.name}
              className="w-full h-[75vh] rounded border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
