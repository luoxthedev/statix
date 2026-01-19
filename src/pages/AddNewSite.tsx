import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Footer';
import { Dropzone } from '@/components/Dropzone';
import { useSiteStore } from '@/stores/siteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Globe, 
  ChevronDown, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AddNewSite() {
  const navigate = useNavigate();
  const { createSite, uploadFiles, isLoading } = useSiteStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  const previewUrl = name ? `https://${slugify(name)}.staticsitehost.fr` : '';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Le nom du site est requis');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const site = await createSite(name, description);
      
      if (files.length > 0) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);
        
        await uploadFiles(site.id, files);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
      }
      
      toast.success('Site créé avec succès !');
      navigate(`/sites/${site.id}`);
    } catch (error) {
      toast.error('Erreur lors de la création du site');
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };
  
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Ajouter un nouveau site</h1>
          <p className="text-muted-foreground mt-1">
            Déployez votre site statique en quelques secondes
          </p>
        </motion.div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Dropzone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass rounded-xl p-6 card-shadow">
                <h2 className="text-lg font-semibold mb-4">Fichiers du site</h2>
                <Dropzone 
                  onFilesAccepted={setFiles}
                  isUploading={isCreating && files.length > 0}
                  uploadProgress={uploadProgress}
                />
                
                {files.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Vous pouvez aussi ajouter des fichiers après la création du site
                  </p>
                )}
              </div>
            </motion.div>
            
            {/* Right: Configuration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass rounded-xl p-6 card-shadow">
                <h2 className="text-lg font-semibold mb-4">Configuration</h2>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nom du site <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Mon super site"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-muted/50 border-border"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnelle)</Label>
                    <Textarea
                      id="description"
                      placeholder="Une brève description de votre site..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-muted/50 border-border min-h-[100px]"
                    />
                  </div>
                  
                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">URL de prévisualisation</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono truncate text-primary">
                          {previewUrl}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Advanced Options */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <div className="glass rounded-xl card-shadow overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center justify-between w-full p-6 text-left hover:bg-muted/30 transition-colors"
                    >
                      <h2 className="text-lg font-semibold">Options avancées</h2>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customDomain" className="text-muted-foreground">
                          Domaine personnalisé
                        </Label>
                        <Input
                          id="customDomain"
                          placeholder="www.monsite.com"
                          className="bg-muted/50 border-border"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Disponible après la création du site
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">SSL automatique</p>
                          <p className="text-xs text-muted-foreground">Certificat Let's Encrypt gratuit</p>
                        </div>
                        <div className="w-8 h-5 bg-success/20 rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-success rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
              
              {/* Submit */}
              <Button 
                type="submit"
                size="lg"
                className="w-full h-12 bg-primary hover:bg-primary/90"
                disabled={isCreating || !name.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Créer le site
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
