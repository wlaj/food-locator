"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRestaurant, updateRestaurant } from "@/lib/actions"
import { Restaurant } from "@/app/global"
import { toast } from "sonner"
import RestaurantImageUpload from "@/components/restaurant-image-upload"
import DietaryTagSelector from "@/components/dietary-tag-selector"

interface RestaurantDialogProps {
  restaurant?: Restaurant
  trigger: React.ReactNode
}

export default function RestaurantDialog({ restaurant, trigger }: RestaurantDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(restaurant?.image_url || null)
  
  const isEditing = !!restaurant

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    try {
      let result
      if (isEditing) {
        result = await updateRestaurant(restaurant.id, formData)
      } else {
        result = await createRestaurant(formData)
      }
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Restaurant ${isEditing ? 'updated' : 'created'} successfully`)
        setOpen(false)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the restaurant details below.' : 'Fill in the details to add a new restaurant.'}
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={restaurant?.name || ''}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                name="cuisine"
                defaultValue={restaurant?.cuisine || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={restaurant?.location || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="52.3676"
                defaultValue={restaurant?.latitude || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="4.9041"
                defaultValue={restaurant?.longitude || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price Level (1-5)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                max="5"
                defaultValue={restaurant?.price || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating_score">Rating (0-5)</Label>
              <Input
                id="rating_score"
                name="rating_score"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={restaurant?.rating_score || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="atmosphere">Atmosphere (1-10)</Label>
              <Input
                id="atmosphere"
                name="atmosphere"
                type="number"
                min="1"
                max="10"
                defaultValue={restaurant?.atmosphere || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="authenticity">Authenticity (1-10)</Label>
              <Input
                id="authenticity"
                name="authenticity"
                type="number"
                min="1"
                max="10"
                defaultValue={restaurant?.authenticity || ''}
              />
            </div>
            
            <div className="space-y-2 md:col-span-3">
              <Label>Restaurant Image</Label>
              <RestaurantImageUpload 
                defaultImageUrl={currentImageUrl || undefined}
                name="image_url"
                onImageChange={(imageUrl) => setCurrentImageUrl(imageUrl)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={restaurant?.description || ''}
            />
          </div>
          
          <DietaryTagSelector 
            defaultValues={restaurant?.dietary || []}
            name="dietary"
            placeholder="Add dietary option"
          />
          
          <div className="space-y-2">
            <Label htmlFor="favorite_dishes">Favorite Dishes (comma-separated)</Label>
            <Input
              id="favorite_dishes"
              name="favorite_dishes"
              placeholder="pasta, pizza, salad"
              defaultValue={restaurant?.favorite_dishes?.join(', ') || ''}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}