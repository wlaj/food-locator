"use client"

import { useId, useState } from "react"
import { CheckIcon, ImagePlusIcon } from "lucide-react"
import { User } from "@supabase/supabase-js"
import Image from "next/image"

import { useCharacterLimit } from "@/hooks/use-character-limit"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { compressImage, avatarCompressionOptions } from "@/lib/image-compression"
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
import { Textarea } from "@/components/ui/textarea"
import { updateUserProfile } from "@/lib/auth-actions"

// const initialBgImage = [
//   {
//     name: "profile-bg.jpg",
//     size: 1528737,
//     type: "image/jpeg",
//     url: "/profile-bg.jpg",
//     id: "profile-bg-123456789",
//   },
// ]


interface ProfileEditDialogProps {
  user: User | null
}

export default function ProfileEditDialog({ user }: ProfileEditDialogProps) {
  const id = useId()

  const maxLength = 180
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: user?.user_metadata?.bio || "Hey, I am here to find the best food locations!",
  })

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 max-h-[90vh] p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a
          username.
        </DialogDescription>
        <form className="flex flex-col flex-1 min-h-0" action={updateUserProfile}>
          <div className="overflow-y-auto flex-1">
            {/* <ProfileBg /> */}
            <Avatar user={user} />
            <div className="px-6 pt-4 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>First name</Label>
                  <Input
                    id={`${id}-first-name`}
                    name="first_name"
                    placeholder="First name"
                    defaultValue={user?.user_metadata?.first_name || ""}
                    type="text"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Last name</Label>
                  <Input
                    id={`${id}-last-name`}
                    name="last_name"
                    placeholder="Last name"
                    defaultValue={user?.user_metadata?.last_name || ""}
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <div className="relative">
                  <Input
                    id={`${id}-username`}
                    name="username"
                    className="peer pe-9"
                    placeholder="Username"
                    defaultValue={user?.user_metadata?.username || ""}
                    type="text"
                    required
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                    <CheckIcon
                      size={16}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-website`}>Website</Label>
                <div className="flex rounded-md shadow-xs">
                  <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
                    https://
                  </span>
                  <Input
                    id={`${id}-website`}
                    name="website"
                    className="-ms-px rounded-s-none shadow-none"
                    placeholder="yourwebsite.com"
                    defaultValue={user?.user_metadata?.website || ""}
                    type="text"
                  />
                </div>
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-bio`}>Biography</Label>
                <Textarea
                  id={`${id}-bio`}
                  name="bio"
                  placeholder="Write a few sentences about yourself"
                  defaultValue={value}
                  maxLength={maxLength}
                  onChange={handleChange}
                  aria-describedby={`${id}-description`}
                />
                <p
                  id={`${id}-description`}
                  className="text-muted-foreground mt-2 text-right text-xs"
                  role="status"
                  aria-live="polite"
                >
                  <span className="tabular-nums">{limit - characterCount}</span>{" "}
                  characters left
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// function ProfileBg() {
//   const [{ files }, { removeFile, openFileDialog, getInputProps }] =
//     useFileUpload({
//       accept: "image/*",
//       initialFiles: initialBgImage,
//     })

//   const currentImage = files[0] ? ('preview' in files[0] ? files[0].preview : files[0].url) : null

//   return (
//     <div className="h-32">
//       <div className="bg-muted relative flex size-full items-center justify-center overflow-hidden">
//         {currentImage && (
//           <img
//             className="size-full object-cover"
//             src={currentImage}
//             alt={
//               files[0] && 'preview' in files[0]
//                 ? "Preview of uploaded image"
//                 : "Default profile background"
//             }
//             width={512}
//             height={96}
//           />
//         )}
//         <div className="absolute inset-0 flex items-center justify-center gap-2">
//           <button
//             type="button"
//             className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
//             onClick={openFileDialog}
//             aria-label={currentImage ? "Change image" : "Upload image"}
//           >
//             <ImagePlusIcon size={16} aria-hidden="true" />
//           </button>
//           {currentImage && (
//             <button
//               type="button"
//               className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
//               onClick={() => removeFile(files[0]?.id)}
//               aria-label="Remove image"
//             >
//               <XIcon size={16} aria-hidden="true" />
//             </button>
//           )}
//         </div>
//       </div>
//       <input
//         {...getInputProps()}
//         className="sr-only"
//         aria-label="Upload image file"
//       />
//     </div>
//   )
// }

function Avatar({ user }: { user: User | null }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, avatarCompressionOptions)
        const url = URL.createObjectURL(compressed)
        setSelectedImage(url)
        setCompressedFile(compressed)
        
        // Update the file input with the compressed file
        const dt = new DataTransfer()
        dt.items.add(compressed)
        if (event.target) {
          event.target.files = dt.files
        }
      } catch (error) {
        console.error('Error compressing image:', error)
        const url = URL.createObjectURL(file)
        setSelectedImage(url)
        setCompressedFile(file)
      }
    }
  }
  
  const openFileDialog = () => {
    document.getElementById('avatar-upload')?.click()
  }

  return (
    <div className="mt-6 px-6">
      <div className="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Profile preview"
            className="size-full object-cover"
            width={80}
            height={80}
          />
        )}
        <button
          type="button"
          className="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
          onClick={openFileDialog}
          aria-label="Change profile picture"
        >
          <ImagePlusIcon size={16} aria-hidden="true" />
        </button>
        <input
          id="avatar-upload"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  )
}