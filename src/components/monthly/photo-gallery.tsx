"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeletePhoto } from "@/hooks/use-photos";
import { getCategoryLabel } from "@/lib/constants";
import type { TaskPhoto } from "@/hooks/use-photos";

interface PhotoGalleryProps {
  photos: TaskPhoto[];
  isLoading: boolean;
  isReadOnly: boolean;
}

export function PhotoGallery({ photos, isLoading, isReadOnly }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<TaskPhoto | null>(null);
  const deletePhoto = useDeletePhoto();

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Progress Photos
              </CardTitle>
              {photos.length > 0 && (
                <Badge variant="secondary">{photos.length} photos</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {photos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No photos yet</p>
                <p className="text-xs">
                  Complete a task and click the camera icon to capture your progress
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {photos.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(photo)}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border hover:border-primary transition-colors"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.task.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                      <div className="p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity w-full">
                        <p className="text-[10px] font-medium truncate">
                          {photo.task.title}
                        </p>
                        <p className="text-[9px] opacity-80">
                          {format(new Date(photo.date), "MMM d")}
                        </p>
                      </div>
                    </div>
                    <div
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: photo.task.color }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selected.task.color }}
                  />
                  {selected.task.title}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {getCategoryLabel(selected.task.category)}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <img
                  src={selected.imageUrl}
                  alt={selected.task.title}
                  className="w-full max-h-96 object-contain bg-muted rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selected.date), "MMMM d, yyyy")}
                  </p>
                  {!isReadOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deletePhoto.mutate(selected.id, {
                          onSuccess: () => setSelected(null),
                        });
                      }}
                      disabled={deletePhoto.isPending}
                    >
                      {deletePhoto.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
