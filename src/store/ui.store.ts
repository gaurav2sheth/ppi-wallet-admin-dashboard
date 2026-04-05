import { create } from 'zustand';
import { STORAGE_KEYS } from '../utils/constants';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  breadcrumbs: BreadcrumbItem[];

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  hydrate: () => void;
  getSnapshot: () => { sidebarCollapsed: boolean; breadcrumbs: BreadcrumbItem[] };
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  breadcrumbs: [{ title: 'Dashboard' }],

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  setBreadcrumbs: (items: BreadcrumbItem[]) => set({ breadcrumbs: items }),

  hydrate: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    if (stored === 'true') set({ sidebarCollapsed: true });
  },

  getSnapshot: () => {
    const { sidebarCollapsed, breadcrumbs } = get();
    return { sidebarCollapsed, breadcrumbs };
  },
}));
