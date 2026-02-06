import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';
import { SiteCard } from '@/components/ui/SiteCard';
import { useSiteStore } from '@/stores/siteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Globe, 
  Activity, 
  HardDrive, 
  Wifi, 
  Plus, 
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function SiteDashboard() {
  const { sites, fetchSites, isLoading } = useSiteStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useTranslation();
  
  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const totalSites = sites.length;
    const activeSites = sites.filter(s => s.status === 'active').length;
    const totalStorage = sites.reduce((acc, s) => acc + s.totalSizeBytes, 0);
    const totalBandwidth = sites.reduce((acc, s) => acc + s.bandwidthBytes30d, 0);
    const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
    
    return {
      totalSites,
      activeSites,
      totalStorage,
      totalBandwidth,
      storagePercentage: Math.round((totalStorage / maxStorage) * 100)
    };
  }, [sites]);
  
  // Filter and sort sites
  const filteredSites = useMemo(() => {
    let result = [...sites];
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'visitors':
        result.sort((a, b) => b.visitors30d - a.visitors30d);
        break;
    }
    
    return result;
  }, [sites, searchQuery, sortBy]);
  
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      
      <main className="container px-4 md:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">{t('my_hosted_sites')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('manage_sites_desc')}
          </p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t('total_sites')}
            value={stats.totalSites}
            icon={Globe}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title={t('active_sites')}
            value={stats.activeSites}
            icon={Activity}
            subtitle={t('percent_of_total', { percent: stats.totalSites > 0 ? Math.round((stats.activeSites / stats.totalSites) * 100) : 0 })}
          />
          <StatCard
            title={t('storage_used')}
            value={formatBytes(stats.totalStorage)}
            icon={HardDrive}
            progress={stats.storagePercentage}
          />
          <StatCard
            title={t('bandwidth')}
            value={formatBytes(stats.totalBandwidth)}
            icon={Wifi}
            subtitle={t('last_30_days')}
          />
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search_sites')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-border">
                <SelectValue placeholder={t('sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('recent')}</SelectItem>
                <SelectItem value="name">{t('name')}</SelectItem>
                <SelectItem value="visitors">{t('visitors')}</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/add-new-site">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('new_site_button')}</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Sites Grid */}
        {filteredSites.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredSites.map((site, index) => (
              <SiteCard key={site.id} site={site} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? t('no_sites_search') : t('no_sites_yet')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? t('try_other_search')
                : t('create_first_site')
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link to="/add-new-site">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create_a_site')}
                </Link>
              </Button>
            )}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
