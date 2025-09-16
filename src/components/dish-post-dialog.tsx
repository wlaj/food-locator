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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDishWithPost, uploadDishImage, getRestaurants } from "@/lib/actions";
import { toast } from "sonner";
import { LoaderCircleIcon, Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import Image from "next/image";

interface DishPostDialogProps {
  trigger: React.ReactNode;
  preselectedRestaurantId?: string;
}

export default function DishPostDialog({
  trigger,
  preselectedRestaurantId,
}: DishPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    preselectedRestaurantId || ""
  );
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    path: string;
    file: File;
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, getInputProps }
  ] = useFileUpload({
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setLoading(true);

    try {
      const result = await uploadDishImage(file);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUploadedImage({
        url: result.url!,
        path: result.path!,
        file,
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants(100);
      if (data) {
        setRestaurants(data);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    if (!uploadedImage) {
      toast.error("Please upload an image of the dish");
      setLoading(false);
      return;
    }

    if (!selectedRestaurantId) {
      toast.error("Please select a restaurant");
      setLoading(false);
      return;
    }

    // Add image and restaurant data to form
    formData.append("imageUrl", uploadedImage.url);
    formData.append("imagePath", uploadedImage.path);
    formData.append("fileName", uploadedImage.file.name);
    formData.append("fileSize", uploadedImage.file.size.toString());
    formData.append("mimeType", uploadedImage.file.type);
    formData.append("restaurantId", selectedRestaurantId);

    try {
      const result = await createDishWithPost(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Dish post created successfully!");
      setOpen(false);
      formRef.current?.reset();
      setUploadedImage(null);
      setSelectedRestaurantId(preselectedRestaurantId || "");
    } catch (error) {
      console.error("Error creating dish post:", error);
      toast.error("Failed to create dish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={loadRestaurants}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Dish</DialogTitle>
          <DialogDescription>
            Upload a photo of a dish and share it with the community.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Dish Photo *</Label>
            {!uploadedImage ? (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  handleDrop(e);
                  const files = Array.from(e.dataTransfer.files);
                  handleImageUpload(files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : errors.length > 0
                    ? "border-destructive bg-destructive/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                <input
                  {...getInputProps()}
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleImageUpload(files);
                  }}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a dish photo here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, JPEG, WebP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={uploadedImage.url}
                  alt="Uploaded dish"
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.length > 0 && (
              <p className="text-sm text-destructive">
                {errors[0]}
              </p>
            )}
          </div>

          {/* Restaurant Selection */}
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant *</Label>
            <Select
              value={selectedRestaurantId}
              onValueChange={setSelectedRestaurantId}
              disabled={!!preselectedRestaurantId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dish Name */}
          <div className="space-y-2">
            <Label htmlFor="dishName">Dish Name *</Label>
            <Input
              id="dishName"
              name="dishName"
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
              placeholder="Describe the dish (optional)"
              rows={2}
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
              placeholder="e.g., 12.50"
            />
          </div>

          {/* Content/Review */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="What did you think of this dish?"
              rows={3}
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Select name="context">
              <SelectTrigger>
                <SelectValue placeholder="Select context (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourist">Tourist</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading || !uploadedImage || !selectedRestaurantId}>
              {loading && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
              Share Dish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}