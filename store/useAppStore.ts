import { create } from 'zustand'

interface AppState {
  isAiChatOpen: boolean
  activeShoppingListId: string | null
  setAiChatOpen: (isOpen: boolean) => void
  setActiveShoppingListId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  isAiChatOpen: false,
  activeShoppingListId: null,
  setAiChatOpen: (isOpen) => set({ isAiChatOpen: isOpen }),
  setActiveShoppingListId: (id) => set({ activeShoppingListId: id }),
}))
