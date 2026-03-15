"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUploadPhoto, useDeletePhoto } from "@/hooks/use-photos";
import type { TaskPhoto } from "@/hooks/use-photos";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  taskColor: string;
  date: string;
  existingPhoto?: TaskPhoto;
  readOnly?: boolean;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  taskColor,
  date,
  existingPhoto,
  readOnly = false,
}: PhotoUploadDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();

  const formattedDate = format(new Date(date + "T00:00:00"), "MMM d, yyyy");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onerror = () => toast.error("Failed to read file");
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  function handleUpload() {
    if (!file) return;
    uploadPhoto.mutate(
      { taskId, date, image: file },
      {
        onSuccess: () => {
          setFile(null);
          setPreview(null);
          onOpenChange(false);
        },
      }
    );
  }

  function handleDelete() {
    if (!existingPhoto) return;
    deletePhoto.mutate(existingPhoto.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: taskColor }}
            />
            {taskTitle}
          </DialogTitle>
          <DialogDescription>{formattedDate}</DialogDescription>
        </DialogHeader>

        {existingPhoto ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={existingPhoto.imageUrl}
                alt={`${taskTitle} - ${formattedDate}`}
                className="w-full max-h-80 object-contain bg-muted rounded-lg"
              />
            </div>
            {!readOnly && (
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deletePhoto.isPending}
                >
                  {deletePhoto.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Remove Photo
                </Button>
              </DialogFooter>
            )}
          </div>
        ) : readOnly ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Photo uploads are not available for past months.
          </p>
        ) : (
          <div className="space-y-4">
            {preview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain bg-muted rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <Camera className="h-10 w-10" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload photo</p>
                  <p className="text-xs">JPG, PNG up to 5MB</p>
                </div>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={!file || uploadPhoto.isPending}
              >
                {uploadPhoto.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploadPhoto.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
