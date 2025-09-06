"use client"

import { useId, useState, useEffect } from "react"
import { Tag, TagInput } from "emblor"

import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getDietaryOptions } from "@/lib/actions"

interface DietaryOption {
  id: string
  name: string
  description?: string
}

interface DietaryTagSelectorProps {
  defaultValues?: string[]
  name?: string
  placeholder?: string
}

export default function DietaryTagSelector({ 
  defaultValues = [], 
  name = "dietary",
  placeholder = "Add dietary option"
}: DietaryTagSelectorProps) {
  const id = useId()
  const [availableOptions, setAvailableOptions] = useState<DietaryOption[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDietaryOptions() {
      try {
        setIsLoading(true)
        const options = await getDietaryOptions()
        console.log('Fetched dietary options:', options) // Debug log
        if (options) {
          setAvailableOptions(options)
        }
      } catch (error) {
        console.error('Error fetching dietary options:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDietaryOptions()
  }, [])

  useEffect(() => {
    if (defaultValues.length > 0 && availableOptions.length > 0) {
      const defaultTags = defaultValues.map(value => {
        const option = availableOptions.find(opt => opt.name === value)
        return {
          id: option?.id || value,
          text: option?.name || value,
        }
      })
      setSelectedTags(defaultTags)
    }
  }, [defaultValues, availableOptions])

  const autocompleteData = availableOptions.map(option => ({
    id: option.id,
    text: option.name,
  }))

  console.log('Available options for autocomplete:', autocompleteData) // Debug log

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Dietary Options</Label>
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading dietary options...</div>
      ) : (
        <TagInput
          id={id}
          tags={selectedTags}
          setTags={(newTags) => {
            console.log('Tags updated:', newTags) // Debug log
            setSelectedTags(newTags)
          }}
          placeholder={placeholder}
          styleClasses={{
            inlineTagsContainer:
              "border-input rounded-md bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring outline-none focus-within:ring-[3px] focus-within:ring-ring/50 p-1 gap-1",
            input: "w-full min-w-[80px] shadow-none px-2 h-7",
            tag: {
              body: "h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
              closeButton:
                "absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
            },
            autoComplete: {
              popoverContent: "p-0 w-[240px] max-h-[300px]",
              command: "h-full max-h-[300px]",
              commandList: "max-h-[250px] overflow-y-auto p-1",
              commandGroup: "px-2 py-1.5 text-sm font-medium text-muted-foreground",
              commandItem: "px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm text-sm transition-colors",
            },
          }}
          activeTagIndex={activeTagIndex}
          setActiveTagIndex={setActiveTagIndex}
          autocompleteOptions={autocompleteData}
          enableAutocomplete={true}
          showCount={false}
        />
      )}
      
      {/* Hidden input to send data with form */}
      <input
        type="hidden"
        name={name}
        value={selectedTags.map(tag => tag.text).join(',')}
      />
      
      <p className="text-muted-foreground mt-1 text-xs">
        Select from predefined dietary options ({availableOptions.length} available) or add custom ones
      </p>
    </div>
  )
}