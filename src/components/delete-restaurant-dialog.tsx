"use client"

import { useId, useState } from "react"
import { CircleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeleteRestaurantDialogProps {
  restaurantName: string
  onConfirm: () => Promise<void>
  trigger: React.ReactNode
  isLoading?: boolean
}

export default function DeleteRestaurantDialog({ 
  restaurantName, 
  onConfirm, 
  trigger,
  isLoading = false 
}: DeleteRestaurantDialogProps) {
  const id = useId()
  const [inputValue, setInputValue] = useState("")
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
    setInputValue("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setInputValue("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Final confirmation
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              This action cannot be undone. To confirm, please enter the restaurant
              name <span className="text-foreground">{restaurantName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5">
          <div className="*:not-first:mt-2">
            <Label htmlFor={id}>Restaurant name</Label>
            <Input
              id={id}
              type="text"
              placeholder={`Type ${restaurantName} to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== restaurantName || isLoading}
              onClick={handleConfirm}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}