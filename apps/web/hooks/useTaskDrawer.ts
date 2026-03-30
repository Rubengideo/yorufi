import { create } from 'zustand'

interface TaskDrawerState {
  openTaskId: string | null
  openTask: (id: string) => void
  closeTask: () => void
}

export const useTaskDrawerStore = create<TaskDrawerState>((set) => ({
  openTaskId: null,
  openTask: (id) => set({ openTaskId: id }),
  closeTask: () => set({ openTaskId: null }),
}))
