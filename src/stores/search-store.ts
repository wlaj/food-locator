import { create } from 'zustand';
import type { Tag } from 'emblor';

interface SearchState {
  // Search query state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Dropdown states
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  showHashtagDropdown: boolean;
  setShowHashtagDropdown: (show: boolean) => void;
  
  // Search terms for dropdowns
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
  hashtagSearchTerm: string;
  setHashtagSearchTerm: (term: string) => void;
  
  // Tags
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
  
  // Location
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  
  // Control flags
  justSelectedUser: boolean;
  setJustSelectedUser: (value: boolean) => void;
  isUpdatingFromUrl: boolean;
  setIsUpdatingFromUrl: (value: boolean) => void;
  
  // Actions
  closeAllDropdowns: () => void;
  resetSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  searchQuery: '',
  showUserDropdown: false,
  showHashtagDropdown: false,
  userSearchTerm: '',
  hashtagSearchTerm: '',
  selectedTags: [],
  selectedLocation: 'amsterdam',
  justSelectedUser: false,
  isUpdatingFromUrl: false,
  
  // Setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowUserDropdown: (show) => set({ showUserDropdown: show }),
  setShowHashtagDropdown: (show) => set({ showHashtagDropdown: show }),
  setUserSearchTerm: (term) => set({ userSearchTerm: term }),
  setHashtagSearchTerm: (term) => set({ hashtagSearchTerm: term }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setJustSelectedUser: (value) => set({ justSelectedUser: value }),
  setIsUpdatingFromUrl: (value) => set({ isUpdatingFromUrl: value }),
  
  // Actions
  closeAllDropdowns: () => set({ 
    showUserDropdown: false, 
    showHashtagDropdown: false 
  }),
  
  resetSearch: () => set({
    searchQuery: '',
    showUserDropdown: false,
    showHashtagDropdown: false,
    userSearchTerm: '',
    hashtagSearchTerm: '',
    selectedTags: [],
    justSelectedUser: false,
    isUpdatingFromUrl: false,
  }),
}));