import { create } from 'zustand';

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
}

// Generate mock sites for demo
const generateMockSites = (): Site[] => {
  const statuses: SiteStatus[] = ['active', 'active', 'active', 'deploying', 'failed', 'active'];
  const siteNames = [
    'Portfolio Pro',
    'Landing Startup',
    'Blog Personnel',
    'Documentation API',
    'E-commerce Preview',
    'Application Marketing'
  ];
  
  return siteNames.map((name, index) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    return {
      id: `site-${index + 1}`,
      ownerId: '1',
      name,
      slug,
      description: `Description du site ${name}`,
      status: statuses[index],
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastDeployAt: statuses[index] !== 'failed' ? new Date().toISOString() : null,
      totalSizeBytes: Math.floor(Math.random() * 50 * 1024 * 1024) + 1024 * 1024,
      fileCount: Math.floor(Math.random() * 50) + 5,
      bandwidthBytes30d: Math.floor(Math.random() * 500 * 1024 * 1024),
      visitors30d: Math.floor(Math.random() * 5000) + 100,
      customDomain: index === 0 ? 'www.portfolio-pro.com' : null,
      sslActive: true,
      previewImage: null,
      files: generateMockFiles(`site-${index + 1}`, Math.floor(Math.random() * 10) + 3)
    };
  });
};

const generateMockFiles = (siteId: string, count: number): SiteFile[] => {
  const fileTypes = [
    { name: 'index.html', mime: 'text/html' },
    { name: 'style.css', mime: 'text/css' },
    { name: 'script.js', mime: 'application/javascript' },
    { name: 'logo.png', mime: 'image/png' },
    { name: 'favicon.ico', mime: 'image/x-icon' },
    { name: 'about.html', mime: 'text/html' },
    { name: 'contact.html', mime: 'text/html' },
    { name: 'main.js', mime: 'application/javascript' },
    { name: 'utils.js', mime: 'application/javascript' },
    { name: 'theme.css', mime: 'text/css' },
  ];
  
  return fileTypes.slice(0, count).map((file, index) => ({
    id: `${siteId}-file-${index}`,
    siteId,
    path: `/${file.name}`,
    originalName: file.name,
    sizeBytes: Math.floor(Math.random() * 500 * 1024) + 1024,
    mimeType: file.mime,
    uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: generateMockSites(),
  isLoading: false,

  fetchSites: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  getSite: (id: string) => {
    return get().sites.find(s => s.id === id);
  },

  createSite: async (name: string, description: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const slug = slugify(name);
    const existingSlugs = get().sites.map(s => s.slug);
    let uniqueSlug = slug;
    let counter = 1;
    while (existingSlugs.includes(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const newSite: Site = {
      id: `site-${Date.now()}`,
      ownerId: '1',
      name,
      slug: uniqueSlug,
      description,
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastDeployAt: null,
      totalSizeBytes: 0,
      fileCount: 0,
      bandwidthBytes30d: 0,
      visitors30d: 0,
      customDomain: null,
      sslActive: false,
      previewImage: null,
      files: []
    };
    
    set(state => ({
      sites: [newSite, ...state.sites],
      isLoading: false
    }));
    
    return newSite;
  },

  deleteSite: async (id: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    
    set(state => ({
      sites: state.sites.filter(s => s.id !== id),
      isLoading: false
    }));
  },

  uploadFiles: async (siteId: string, files: File[]) => {
    set({ isLoading: true });
    
    // Simulate upload with progress
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFiles: SiteFile[] = files.map((file, index) => ({
      id: `${siteId}-file-${Date.now()}-${index}`,
      siteId,
      path: `/${file.name}`,
      originalName: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    }));
    
    set(state => ({
      sites: state.sites.map(site => {
        if (site.id === siteId) {
          const updatedFiles = [...site.files, ...newFiles];
          const totalSize = updatedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
          return {
            ...site,
            files: updatedFiles,
            fileCount: updatedFiles.length,
            totalSizeBytes: totalSize,
            status: 'active' as SiteStatus,
            lastDeployAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return site;
      }),
      isLoading: false
    }));
  },

  deleteFile: async (siteId: string, fileId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set(state => ({
      sites: state.sites.map(site => {
        if (site.id === siteId) {
          const updatedFiles = site.files.filter(f => f.id !== fileId);
          const totalSize = updatedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
          return {
            ...site,
            files: updatedFiles,
            fileCount: updatedFiles.length,
            totalSizeBytes: totalSize,
            updatedAt: new Date().toISOString()
          };
        }
        return site;
      })
    }));
  },

  redeploy: async (siteId: string) => {
    set(state => ({
      sites: state.sites.map(site => 
        site.id === siteId ? { ...site, status: 'deploying' as SiteStatus } : site
      )
    }));
    
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
  }
}));
