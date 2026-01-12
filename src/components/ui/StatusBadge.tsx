import { cn } from '@/lib/utils';
import { SiteStatus } from '@/stores/siteStore';
import { CheckCircle, Loader2, XCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: SiteStatus;
  className?: string;
}

const statusConfig: Record<SiteStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: {
    label: 'Actif',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  deploying: {
    label: 'Déploiement',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Loader2
  },
  failed: {
    label: 'Échec',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle
  },
  inactive: {
    label: 'Inactif',
    className: 'bg-muted/50 text-muted-foreground border-border',
    icon: Circle
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
      config.className,
      className
    )}>
      <Icon className={cn('w-3 h-3', status === 'deploying' && 'animate-spin')} />
      {config.label}
    </span>
  );
}
