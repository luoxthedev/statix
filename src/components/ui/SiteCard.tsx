import { cn } from '@/lib/utils';
import { Site } from '@/stores/siteStore';
import { StatusBadge } from './StatusBadge';
import { Globe, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SiteCardProps {
  site: Site;
  index?: number;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

export function SiteCard({ site, index = 0 }: SiteCardProps) {
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
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-8 h-8 text-primary" />
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
              {site.slug}.staticsitehost.fr
            </p>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Créé le {formatDate(site.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-xs">
                <span className="text-muted-foreground">Fichiers: </span>
                <span className="font-medium text-foreground">{site.fileCount}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Visiteurs: </span>
                <span className="font-medium text-foreground">{site.visitors30d.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
