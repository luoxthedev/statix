export default {
  // Domain principal pour l'application
  // Pour le dev local, utilisez 'lvh.me' qui pointe vers 127.0.0.1
  // ou 'localhost' (mais les sous-domaines ne marchent pas sur localhost sans config hosts)
  appDomain: 'lvh.me', 
  
  // Port du serveur
  port: 3000,
  
  // Dossier de stockage des sites
  sitesRoot: process.env.SITES_ROOT || 'uploads',
  
  // Activer les sous-domaines automatiques (ex: slug.domaine.com)
  enableSubdomains: true
};
