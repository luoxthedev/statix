import { cn } from '@/lib/utils';
import { Site } from '@/stores/siteStore';
import { StatusBadge } from './StatusBadge';
import { Globe, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SiteCardProps {
  site: Site;
  index?: number;
}

export function SiteCard({ site, index = 0 }: SiteCardProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/sites/${site.id}`}>
        <div className={cn(
          'group glass rounded-xl overflow-hidden card-shadow',
          'hover:card-shadow-hover hover:border-primary/30 transition-all duration-300',
          'cursor-pointer'
        )}>
          {/* Preview Image */}
          <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-12 h-12 text-muted-foreground/30" />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                 <a 
                  href={`/sites/${site.slug || site.id}/`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur rounded-full shadow-lg hover:bg-background transition-all hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{t('visit')}</span>
                </a>
              </div>
            </div>
            
            {/* Status badge overlay */}
            <div className="absolute top-3 right-3">
              <StatusBadge status={site.status} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {site.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              /sites/{site.slug}
            </p>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('created_on', { date: formatDate(site.createdAt) })}</span>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-xs">
                <span className="text-muted-foreground">{t('files_label')} </span>
                <span className="font-medium text-foreground">{site.fileCount}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">{t('visitors_label')} </span>
                <span className="font-medium text-foreground">{site.visitors30d.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
