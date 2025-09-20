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
import { LoaderCircleIcon } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

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
  const [imageUrl, setImageUrl] = useState<string | null>(dish.image_url || null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    // Handle image updates
    if (imageUrl && imageUrl !== dish.image_url) {
      // New image was uploaded - signal that we have a new URL
      formData.append('newImageUrl', imageUrl);
    } else if (!imageUrl && dish.image_url) {
      // Image was removed
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
            <ImageUpload
              type="dish"
              defaultImageUrl={dish.image_url || undefined}
              onImageChange={setImageUrl}
              name="imageUrl"
            />
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