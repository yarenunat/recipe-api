import { create } from 'zustand'

interface AppState {
  isAiChatOpen: boolean
  activeShoppingListId: string | null
  recipes: any[]
  isRecipesLoaded: boolean
  setAiChatOpen: (isOpen: boolean) => void
  setActiveShoppingListId: (id: string | null) => void
  setRecipes: (recipes: any[]) => void
  fetchRecipes: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  isAiChatOpen: false,
  activeShoppingListId: null,
  recipes: [],
  isRecipesLoaded: false,
  setAiChatOpen: (isOpen) => set({ isAiChatOpen: isOpen }),
  setActiveShoppingListId: (id) => set({ activeShoppingListId: id }),
  setRecipes: (recipes) => set({ recipes, isRecipesLoaded: true }),
  fetchRecipes: async () => {
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ recipes: data, isRecipesLoaded: true });
      } else {
        set({ isRecipesLoaded: true });
      }
    } catch (error) {
      console.error("Failed to fetch recipes", error);
      set({ isRecipesLoaded: true });
    }
  }
}))
