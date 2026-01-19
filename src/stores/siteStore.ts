import { create } from 'zustand';
import { useAuthStore } from './authStore';

export type SiteStatus = 'active' | 'deploying' | 'failed' | 'inactive';

export interface SiteFile {
  id: string;
  siteId: string;
  path: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Site {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  status: SiteStatus;
  createdAt: string;
  updatedAt: string;
  lastDeployAt: string | null;
  totalSizeBytes: number;
  fileCount: number;
  bandwidthBytes30d: number;
  visitors30d: number;
  customDomain: string | null;
  sslActive: boolean;
  previewImage: string | null;
  mainFile: string;
  files: SiteFile[];
}

interface SiteState {
  sites: Site[];
  isLoading: boolean;
  
  fetchSites: () => Promise<void>;
  getSite: (id: string) => Site | undefined;
  createSite: (name: string, description: string) => Promise<Site>;
  deleteSite: (id: string) => Promise<void>;
  uploadFiles: (siteId: string, files: File[]) => Promise<void>;
  deleteFile: (siteId: string, fileId: string) => Promise<void>;
  redeploy: (siteId: string) => Promise<void>;
  updateMainFile: (siteId: string, mainFile: string) => Promise<void>;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  isLoading: false,

  fetchSites: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await fetch('/api/sites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const sites = await res.json();
        set({ sites, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  getSite: (id: string) => {
    return get().sites.find(s => s.id === id);
  },

  createSite: async (name: string, description: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, description })
      });
      
      if (!res.ok) throw new Error('Failed to create site');
      
      const newSite = await res.json();
      set(state => ({
        sites: [newSite, ...state.sites],
        isLoading: false
      }));
      return newSite;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  deleteSite: async (id: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({
        sites: state.sites.filter(s => s.id !== id),
        isLoading: false
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  uploadFiles: async (siteId: string, files: File[]) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const res = await fetch(`/api/sites/${siteId}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
         await get().fetchSites();
      }
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  deleteFile: async (siteId: string, fileId: string) => {
    try {
        const token = useAuthStore.getState().token;
        await fetch(`/api/sites/${siteId}/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        await get().fetchSites();
    } catch {
        // Silently handle file deletion errors
    }
  },

  redeploy: async (siteId: string) => {
    set(state => ({
      sites: state.sites.map(site => 
        site.id === siteId ? { ...site, status: 'deploying' as SiteStatus } : site
      )
    }));
    
    // Simulate deployment time for UX, as usage is instant for static files
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    set(state => ({
      sites: state.sites.map(site => 
        site.id === siteId ? { 
          ...site, 
          status: 'active' as SiteStatus,
          lastDeployAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : site
      )
    }));
  },

  updateMainFile: async (siteId: string, mainFile: string) => {
    try {
        const token = useAuthStore.getState().token;
        const res = await fetch(`/api/sites/${siteId}/main-file`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ mainFile })
        });
        
        if (res.ok) {
            set(state => ({
                sites: state.sites.map(site => 
                    site.id === siteId ? { ...site, mainFile } : site
                )
            }));
        }
    } catch {
        // Silently handle main file update errors
    }
  }
}));

