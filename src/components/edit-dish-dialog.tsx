"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDishPost } from "@/lib/actions";
import { toast } from "sonner";
import { LoaderCircleIcon, Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url?: string | null;
}

interface EditDishDialogProps {
  trigger: React.ReactNode;
  dish: Dish;
  postId: string;
  postContent?: string | null;
  onSuccess?: () => void;
}

export default function EditDishDialog({
  trigger,
  dish,
  postId,
  postContent,
  onSuccess,
}: EditDishDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const initialFiles = dish.image_url ? [{
    id: 'current',
    name: 'Current image',
    size: 0,
    type: 'image',
    url: dish.image_url
  }] : [];

  const [{ files, isDragging, errors }, { 
    handleDragEnter, 
    handleDragLeave, 
    handleDragOver, 
    handleDrop, 
    openFileDialog, 
    removeFile, 
    getInputProps 
  }] = useFileUpload({
    accept: "image/*",
    multiple: false,
    maxSize: 2 * 1024 * 1024,
    initialFiles
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    // Handle image updates
    const newImageFile = files.find(file => 'file' in file);
    if (newImageFile && 'file' in newImageFile) {
      // New image was uploaded
      formData.append('image', newImageFile.file);
    } else if (files.length === 0 && dish.image_url) {
      // Image was removed (no files and there was originally an image)
      formData.append('removeImage', 'true');
    }

    try {
      const result = await updateDishPost(dish.id, postId, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Dish updated successfully!");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating dish:", error);
      toast.error("Failed to update dish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dish</DialogTitle>
          <DialogDescription>
            Update the dish details, image, and your review.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Dish Name */}
          <div className="space-y-2">
            <Label htmlFor="dishName">Dish Name *</Label>
            <Input
              id="dishName"
              name="dishName"
              defaultValue={dish.name}
              placeholder="e.g., Pad Thai, Margherita Pizza"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={dish.description || ""}
              placeholder="Describe the dish (optional)"
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={dish.price || ""}
              placeholder="e.g., 12.50"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Dish Image</Label>
            <div className="space-y-2">
              {files.length > 0 && (
                <div className="relative">
                  {'url' in files[0] ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={files[0].url}
                        alt="Current dish image"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeFile(files[0].id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={files[0].preview}
                        alt="New dish image"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeFile(files[0].id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {files.length > 0 ? "Click or drag to replace image" : "Click or drag to upload image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 2MB
                </p>
              </div>
              
              <input {...getInputProps()} />
              
              {errors.length > 0 && (
                <div className="text-sm text-destructive">
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={postContent || ""}
              placeholder="Share your thoughts about this dish (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
              Update Dish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}