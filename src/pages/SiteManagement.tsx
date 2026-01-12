import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { Dropzone } from '@/components/Dropzone';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSiteStore, SiteFile } from '@/stores/siteStore';
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
  ArrowLeft,
  ExternalLink,
  Calendar,
  HardDrive,
  Users,
  File as FileIcon,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Eye,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const formatShortDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(date));
};

export default function SiteManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSite, deleteSite, deleteFile, uploadFiles, redeploy, isLoading } = useSiteStore();
  
  const site = getSite(id!);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<SiteFile | null>(null);
  const [isRedeploying, setIsRedeploying] = useState(false);
  
  const filteredFiles = useMemo(() => {
    if (!site) return [];
    
    let result = [...site.files];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => f.originalName.toLowerCase().includes(query));
    }
    
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.originalName.localeCompare(b.originalName));
        break;
      case 'size':
        result.sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
    }
    
    return result;
  }, [site, searchQuery, sortBy]);
  
  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Site non trouvé</h2>
          <p className="text-muted-foreground mb-4">Ce site n'existe pas ou a été supprimé</p>
          <Button asChild>
            <Link to="/site-dashboard">Retour au dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      await uploadFiles(site.id, files);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  
  const handleRedeploy = async () => {
    setIsRedeploying(true);
    try {
      await redeploy(site.id);
      toast.success('Redéploiement réussi !');
    } catch (error) {
      toast.error('Erreur lors du redéploiement');
    } finally {
      setIsRedeploying(false);
    }
  };
  
  const handleDeleteSite = async () => {
    try {
      await deleteSite(site.id);
      toast.success('Site supprimé');
      navigate('/site-dashboard');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      await deleteFile(site.id, fileToDelete.id);
      toast.success('Fichier supprimé');
      setFileToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const siteUrl = `https://${site.slug}.staticsitehost.fr`;
  
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      
      <main className="container px-4 md:px-6 py-8">
        {/* Back link */}
        <Link 
          to="/site-dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{site.name}</h1>
              <StatusBadge status={site.status} />
            </div>
            <a 
              href={siteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              {siteUrl}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Files */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-6 card-shadow"
            >
              <h2 className="text-lg font-semibold mb-4">Ajouter des fichiers</h2>
              <Dropzone 
                onFilesAccepted={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 card-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold">
                  Fichiers ({site.fileCount})
                </h2>
                
                <div className="flex gap-3">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-muted/50 border-border text-sm"
                    />
                  </div>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 h-9 bg-muted/50 border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Nom</SelectItem>
                      <SelectItem value="size">Taille</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {filteredFiles.length > 0 ? (
                <div className="space-y-2">
                  {filteredFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)} • {formatShortDate(file.uploadedAt)}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setFileToDelete(file)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Aucun fichier trouvé' : 'Aucun fichier uploadé'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right: Info & Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-xl p-6 card-shadow"
            >
              <h2 className="text-lg font-semibold mb-4">Informations</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Dernier déploiement</p>
                    <p className="font-medium">
                      {site.lastDeployAt ? formatDate(site.lastDeployAt) : 'Jamais'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Taille totale</p>
                    <p className="font-medium">{formatBytes(site.totalSizeBytes)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Visiteurs (30j)</p>
                    <p className="font-medium">{site.visitors30d.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <FileIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Fichiers</p>
                    <p className="font-medium">{site.fileCount}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Domaine personnalisé</p>
                      <p className="font-medium">
                        {site.customDomain || 'Non configuré'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">SSL</p>
                    <p className={`font-medium ${site.sslActive ? 'text-success' : ''}`}>
                      {site.sslActive ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 card-shadow space-y-3"
            >
              <h2 className="text-lg font-semibold mb-2">Actions</h2>
              
              <Button 
                className="w-full justify-start bg-primary hover:bg-primary/90"
                onClick={handleRedeploy}
                disabled={isRedeploying || site.status === 'deploying'}
              >
                {isRedeploying || site.status === 'deploying' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isRedeploying ? 'Déploiement...' : 'Redéployer'}
              </Button>
              
              <Button variant="outline" className="w-full justify-start bg-muted/50 border-border">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le site
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le site
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Delete Site Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer le site"
        description={`Êtes-vous sûr de vouloir supprimer "${site.name}" ? Cette action est irréversible et supprimera tous les fichiers associés.`}
        confirmText="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteSite}
        isLoading={isLoading}
      />
      
      {/* Delete File Dialog */}
      <ConfirmDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        title="Supprimer le fichier"
        description={`Êtes-vous sûr de vouloir supprimer "${fileToDelete?.originalName}" ?`}
        confirmText="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteFile}
      />
    </div>
  );
}
