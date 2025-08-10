import { create } from 'zustand'

export interface CalendarFilterState {
  showNoDue: boolean
  showOverdue: boolean
  setShowNoDue: (show: boolean) => void
  setShowOverdue: (show: boolean) => void
  resetFilters: () => void
}

export const useCalendarFilterStore = create<CalendarFilterState>((set) => ({
  showNoDue: false,
  showOverdue: false,
  setShowNoDue: (show: boolean) =>
    set((state) => ({ ...state, showNoDue: show })),
  setShowOverdue: (show: boolean) =>
    set((state) => ({ ...state, showOverdue: show })),
  resetFilters: () =>
    set((state) => ({ ...state, showNoDue: false, showOverdue: false })),
}))