'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, Settings } from 'lucide-react'
import { updateUserPreferences, getUserPreferences } from '@/lib/auth-actions'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserPreferences {
  dietary_options: string[]
  location: string
  spice_level: string
}

interface PreferencesDropdownProps {
  locations: Array<{
    id: number
    value: string
    label: string
    city: string
    district: string | null
    lat: number
    lon: number
    country: string
    created_at: string | null
    updated_at: string | null
  }>
}

export default function PreferencesDropdown({ locations }: PreferencesDropdownProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary_options: [],
    location: '',
    spice_level: 'mild'
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const dietaryOptions = [
    'vegetarian',
    'vegan', 
    'gluten-free',
    'dairy-free',
    'nut-free',
    'halal',
    'kosher',
    'keto-friendly',
    'low-sodium',
    'organic',
    'paleo',
    'raw',
    'sugar-free',
    'whole30'
  ]

  const spiceLevels = [
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'hot', label: 'Hot' },
    { value: 'very_hot', label: 'Very Hot' }
  ]

  useEffect(() => {
    async function loadPreferences() {
      try {
        const userPrefs = await getUserPreferences()
        if (userPrefs) {
          setPreferences({
            dietary_options: userPrefs.dietary_options || [],
            location: userPrefs.location || '',
            spice_level: userPrefs.spice_level || 'mild'
          })
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }
    
    loadPreferences()
  }, [])

  const handleDietaryOptionToggle = (option: string) => {
    const newDietaryOptions = preferences.dietary_options.includes(option)
      ? preferences.dietary_options.filter(item => item !== option)
      : [...preferences.dietary_options, option]
    
    const newPreferences = { ...preferences, dietary_options: newDietaryOptions }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
  }

  const handleLocationChange = (location: string) => {
    const newPreferences = { ...preferences, location }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
  }

  const handleSpiceLevelChange = (spice_level: string) => {
    const newPreferences = { ...preferences, spice_level }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
  }

  const savePreferences = (prefs: UserPreferences) => {
    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Sign in anonymously if not authenticated
          const { error: authError } = await supabase.auth.signInAnonymously()
          if (authError) {
            console.error('Failed to sign in anonymously:', authError)
            return
          }
          // Small delay to ensure the session is established
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        await updateUserPreferences(prefs)
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    })
  }

  const getPreferenceSummary = () => {
    const parts = []
    
    if (preferences.dietary_options.length > 0) {
      parts.push(preferences.dietary_options.join(', '))
    } else {
      parts.push('No dietary restrictions')
    }
    
    if (preferences.location) {
      const locationLabel = locations.find(loc => loc.value === preferences.location)?.label || preferences.location
      parts.push(`in ${locationLabel}`)
    }
    
    const spiceLabel = spiceLevels.find(level => level.value === preferences.spice_level)?.label || 'Mild'
    parts.push(`${spiceLabel.toLowerCase()} spice`)
    
    return parts.join(' • ')
  }

  const [showCreateAccountHint, setShowCreateAccountHint] = useState(false)

  useEffect(() => {
    // Show hint to create account after user has set preferences
    const checkForAccountHint = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.is_anonymous === true && (
        preferences.dietary_options.length > 0 || 
        preferences.location || 
        preferences.spice_level !== 'mild'
      )) {
        setShowCreateAccountHint(true)
      }
    }
    
    checkForAccountHint()
  }, [preferences])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-2 hover:bg-gray-100 transition-colors"
          disabled={isPending}
        >
          <div className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <ChevronDownIcon className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Your Preferences</span>
            <span className="text-xs text-muted-foreground font-normal">
              {getPreferenceSummary()}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Location Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Location</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={preferences.location} 
              onValueChange={handleLocationChange}
            >
              {locations.map((location) => (
                <DropdownMenuRadioItem
                  key={location.value}
                  value={location.value}
                >
                  {location.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Spice Level Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Spice Level</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={preferences.spice_level} 
              onValueChange={handleSpiceLevelChange}
            >
              {spiceLevels.map((level) => (
                <DropdownMenuRadioItem
                  key={level.value}
                  value={level.value}
                >
                  {level.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Dietary Options */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Dietary Preferences
        </DropdownMenuLabel>
        {dietaryOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={preferences.dietary_options.includes(option)}
            onCheckedChange={() => handleDietaryOptionToggle(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
        
        {showCreateAccountHint && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200">
                <p className="font-medium mb-1">Save Your Preferences</p>
                <p className="mb-2">Create an account to save your preferences permanently and add restaurants.</p>
                <Button asChild size="sm" className="h-6 text-xs">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}