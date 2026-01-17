import express from 'express';
import { getDb } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config.js';

const router = express.Router();
const SITES_ROOT = path.resolve(config.sitesRoot);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If siteId is not in params, it might be in body (depending on how frontend sends it)
    // But for this route structure it's usually /:siteId/deploy
    const siteId = req.params.siteId || req.body.siteId || 'temp';
    const uploadDir = path.join(SITES_ROOT, siteId);
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but prevent collisions if needed
    // For now, just use original
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Get all sites for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const sites = await db.all('SELECT * FROM sites WHERE owner_id = ?', [req.user.id]);
    
    // Convert snake_case to camelCase for frontend
    const formatedSites = await Promise.all(sites.map(async (site) => {
       const files = await db.all('SELECT * FROM site_files WHERE site_id = ?', [site.id]);
       return {
         id: site.id,
         ownerId: site.owner_id,
         name: site.name,
         slug: site.slug,
         description: site.description,
         status: site.status,
         createdAt: site.created_at,
         updatedAt: site.updated_at,
         lastDeployAt: site.last_deploy_at,
         totalSizeBytes: site.total_size_bytes,
         fileCount: site.file_count,
         bandwidthBytes30d: site.bandwidth_bytes_30d,
         visitors30d: site.visitors_30d,
         customDomain: site.custom_domain,
         sslActive: !!site.ssl_active,
         previewImage: site.preview_image,
         mainFile: site.main_file || 'index.html',
         files: files.map(f => ({
            id: f.id,
            siteId: f.site_id,
            path: f.path,
            originalName: f.original_name,
            sizeBytes: f.size_bytes,
            mimeType: f.mime_type,
            uploadedAt: f.uploaded_at
         }))
       };
    }));

    res.json(formatedSites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Site
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = await getDb();
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const id = uuidv4();

    await db.run(
      `INSERT INTO sites (id, owner_id, name, slug, description, status) 
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [id, req.user.id, name, slug, description]
    );

    const newSite = await db.get('SELECT * FROM sites WHERE id = ?', [id]);
    
    // Format response
    res.json({
        id: newSite.id,
        ownerId: newSite.owner_id,
        name: newSite.name,
        slug: newSite.slug,
        description: newSite.description,
        status: newSite.status,
        createdAt: newSite.created_at,
        updatedAt: newSite.updated_at,
        files: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Site
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const site = await db.get('SELECT * FROM sites WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    
    if (!site) return res.status(404).json({ error: 'Site introuvable ou accès refusé' });

    await db.run('DELETE FROM sites WHERE id = ?', [req.params.id]);
    
    // Also delete files on disk would be good here
    
    res.json({ message: 'Site supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Files
router.post('/:siteId/files', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    const db = await getDb();
    const siteId = req.params.siteId;
    
    // Check ownership
    const site = await db.get('SELECT * FROM sites WHERE id = ? AND owner_id = ?', [siteId, req.user.id]);
    if (!site) return res.status(404).json({ error: 'Site introuvable' });

    const files = req.files;
    
    for (const file of files) {
      await db.run(
        `INSERT INTO site_files (id, site_id, path, original_name, size_bytes, mime_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), siteId, file.path, file.originalname, file.size, file.mimetype]
      );
    }
    
    // Update stats
    const totalSize = (site.total_size_bytes || 0) + files.reduce((acc, f) => acc + f.size, 0);
    const fileCount = (site.file_count || 0) + files.length;
    
    await db.run('UPDATE sites SET total_size_bytes = ?, file_count = ?, updated_at = datetime("now") WHERE id = ?', 
      [totalSize, fileCount, siteId]);

    res.json({ message: 'Fichiers uploadés avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete File
router.delete('/:siteId/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const siteId = req.params.siteId;
    const fileId = req.params.fileId;

    // Check ownership
    const site = await db.get('SELECT * FROM sites WHERE id = ? AND owner_id = ?', [siteId, req.user.id]);
    if (!site) return res.status(404).json({ error: 'Site introuvable' });

    const file = await db.get('SELECT * FROM site_files WHERE id = ? AND site_id = ?', [fileId, siteId]);
    if (file) {
      await db.run('DELETE FROM site_files WHERE id = ?', [fileId]);
      
      // Attempt to delete from disk
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch(e) {}
      }
      
      // Update stats
      const totalSize = Math.max(0, (site.total_size_bytes || 0) - (file.size_bytes || 0));
      const fileCount = Math.max(0, (site.file_count || 0) - 1);
       await db.run('UPDATE sites SET total_size_bytes = ?, file_count = ?, updated_at = datetime("now") WHERE id = ?', 
       [totalSize, fileCount, siteId]);
    }
    
    res.json({ message: 'Fichier supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update main file
router.patch('/:siteId/main-file', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const siteId = req.params.siteId;
    const { mainFile } = req.body;

    // Check ownership
    const site = await db.get('SELECT * FROM sites WHERE id = ? AND owner_id = ?', [siteId, req.user.id]);
    if (!site) return res.status(404).json({ error: 'Site introuvable' });

    await db.run('UPDATE sites SET main_file = ?, updated_at = datetime("now") WHERE id = ?', [mainFile, siteId]);
    
    res.json({ message: 'Fichier principal mis à jour', mainFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
