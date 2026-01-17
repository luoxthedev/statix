import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import serveIndex from 'serve-index';
import authRoutes from './routes/auth.js';
import siteRoutes from './routes/sites.js';

import { getDb } from './database.js';
import config from './config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port || 3000;
const SITES_ROOT = path.resolve(config.sitesRoot); // Use absolute path

app.use(cors());
app.use(express.json());

// Create uploads folder if not exists
if (!fs.existsSync(SITES_ROOT)) {
  fs.mkdirSync(SITES_ROOT, { recursive: true });
}

// Middleware for Subdomain Routing
app.use(async (req, res, next) => {
  const host = req.get('host'); // e.g., slug.lvh.me:3000
  const mainDomain = config.appDomain;
  
  // If request is for the main domain or IP, continue normal routing
  if (!config.enableSubdomains || !host || host.startsWith('localhost') || host.startsWith('127.0.0.1') || host === mainDomain || host === `${mainDomain}:${PORT}`) {
    return next();
  }

  // Extract subdomain
  // logic: host is "sub.domain.com:3000"
  // We want "sub"
  
  // Remove port if present
  const hostname = host.split(':')[0];
  
  // Check if it ends with main domain
  if (hostname.endsWith(mainDomain)) {
    // extract slug. 
    // e.g. "mysite.lvh.me" -> "mysite"
    // e.g. "mysite.staging.lvh.me" -> "mysite.staging" (if we supported nested)
    const parts = hostname.slice(0, -(mainDomain.length + 1)).split('.');
    const slug = parts[parts.length - 1]; // Take the last part before domain as slug

    if (slug && slug !== 'www') {
       try {
         const db = await getDb();
         const site = await db.get('SELECT * FROM sites WHERE slug = ?', [slug]);
         
         if (site) {
           const sitePath = path.join(SITES_ROOT, site.id);
           if (fs.existsSync(sitePath)) {
             // Get main file (default to index.html)
             const mainFile = site.main_file || 'index.html';
             const mainFilePath = path.join(sitePath, mainFile);
             
             // If specific file requested, serve it
             if (req.path !== '/' && req.path !== '') {
               const staticHandler = express.static(sitePath);
               const indexHandler = serveIndex(sitePath, { icons: true });
               
               staticHandler(req, res, (err) => {
                  if (err) return next(err);
                  indexHandler(req, res, next);
               });
               return;
             }
             
             // Serve main file if it exists
             if (fs.existsSync(mainFilePath)) {
               return res.sendFile(mainFilePath);
             }
             
             // Fallback: serve static or index
             const staticHandler = express.static(sitePath);
             const indexHandler = serveIndex(sitePath, { icons: true });
             
             staticHandler(req, res, (err) => {
                if (err) return next(err);
                indexHandler(req, res, next);
             });
             return; // Stop here, handled async
           }
         }
       } catch (err) {
         console.error("Subdomain routing error:", err);
       }
    }
  }
  
  next();
});

// Serve uploaded files directly (legacy/direct access)
app.use('/uploads', express.static(SITES_ROOT));

// Serve deployed sites specifically (cleaner URL structure)
// This middleware checks if a directory exists for the siteId and serves it
app.use('/sites/:siteId', async (req, res, next) => {
    const siteId = req.params.siteId;
    const sitePath = path.join(SITES_ROOT, siteId);
    
    // Check if path exists and is a directory
    if (fs.existsSync(sitePath) && fs.statSync(sitePath).isDirectory()) {
         try {
             const db = await getDb();
             const site = await db.get('SELECT * FROM sites WHERE id = ?', [siteId]);
             
             // Get main file (default to index.html)
             const mainFile = (site && site.main_file) ? site.main_file : 'index.html';
             const mainFilePath = path.join(sitePath, mainFile);
             
             // If specific file requested, serve it
             if (req.path !== '/' && req.path !== '') {
               const staticHandler = express.static(sitePath);
               const indexHandler = serveIndex(sitePath, { icons: true });

               staticHandler(req, res, (err) => {
                   if (err) return next(err);
                   indexHandler(req, res, next);
               });
               return;
             }
             
             // Serve main file if it exists
             if (fs.existsSync(mainFilePath)) {
               return res.sendFile(mainFilePath);
             }
             
             // Fallback: serve static or directory index
             const staticHandler = express.static(sitePath);
             const indexHandler = serveIndex(sitePath, { icons: true });

             staticHandler(req, res, (err) => {
                 if (err) return next(err);
                 indexHandler(req, res, next);
             });
         } catch (err) {
             console.error("Error serving site:", err);
             next();
         }
    } else {
        // console.log(`[DEBUG] Site path not found: ${sitePath}`);
        next();
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);

app.get('/', (req, res) => {
  res.send('SiteHost API Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving sites from: ${SITES_ROOT}`);
});

