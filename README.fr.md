# SiteHost

Une plateforme moderne d'hébergement de sites statiques avec gestion de fichiers et déploiement en temps réel.
Statix est **L'Alternative** open-source a Netlify.

[🇬🇧 English version](README.md)

## 🚀 Fonctionnalités

- **Gestion de sites statiques** : Uploadez et gérez facilement vos sites HTML/CSS/JS
- **Interface multilingue** : Support du français et de l'anglais (changement de langue en temps réel)
- **Dashboard intuitif** : Visualisez vos sites, statistiques et fichiers en un coup d'œil
- **Déploiement instantané** : Vos sites sont accessibles immédiatement après upload
- **Routage par sous-domaine** : Accédez à vos sites via `slug.lvh.me:3000` ou `/sites/id/`
- **Fichier principal configurable** : Choisissez quel fichier HTML servir par défaut
- **Authentification sécurisée** : Système de login/register avec JWT
- **Gestion de fichiers** : Upload, suppression et organisation de vos fichiers

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le dev server
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **Zustand** pour la gestion d'état
- **i18next** pour l'internationalisation
- **Framer Motion** pour les animations

### Backend
- **Express.js** pour l'API REST
- **SQLite** pour la base de données
- **Multer** pour l'upload de fichiers
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- Git

### Étapes d'installation

```bash
# Cloner le repository
git clone https://github.com/luoxthedev/static-site-host.git
cd static-site-host

# Installer les dépendances du frontend
npm install

# Installer les dépendances du backend
cd server
npm install
cd ..
```

## 🚀 Démarrage

### Démarrage rapide (les deux serveurs)

```bash
# Dans le dossier racine, lancer le backend
npm run server

# Dans un autre terminal, lancer le frontend
npm run dev
```

### Démarrage manuel

**Backend** (port 3000) :
```bash
cd server
npm start
```

**Frontend** (port 8080) :
```bash
npm run dev
```

## 🌐 Accès

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000
- **Sites déployés** : 
  - Par ID : http://localhost:3000/sites/[site-id]/
  - Par sous-domaine : http://[slug].lvh.me:3000/

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `server/` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_ici
SITES_ROOT=uploads
```

### Configuration du serveur

Modifiez `server/config.js` pour personnaliser :

```javascript
module.exports = {
  appDomain: 'lvh.me',        // Domaine pour les sous-domaines
  port: 3000,                 // Port du serveur
  sitesRoot: 'uploads',       // Dossier de stockage des sites
  enableSubdomains: true      // Activer le routage par sous-domaine
};
```

## 📁 Structure du projet

```
.
├── src/                    # Code source frontend
│   ├── components/         # Composants React
│   ├── pages/             # Pages de l'application
│   ├── stores/            # State management (Zustand)
│   ├── locales/           # Fichiers de traduction (FR/EN)
│   └── lib/               # Utilitaires
├── server/                # Code source backend
│   ├── routes/            # Routes Express
│   ├── middleware/        # Middleware (auth, etc.)
│   ├── utils/             # Utilitaires backend
│   ├── uploads/           # Sites hébergés
│   ├── database.js        # Configuration SQLite
│   └── index.js           # Point d'entrée backend
└── public/                # Assets statiques
```

## 🔑 Fonctionnalités principales

### Gestion des sites
- Créer un nouveau site avec nom et slug
- Uploader des fichiers (HTML, CSS, JS, images, etc.)
- Définir un fichier principal personnalisé
- Supprimer des fichiers
- Redéployer un site

### Authentification
- Inscription avec nom, email et mot de passe
- Connexion avec JWT
- Option "Se souvenir de moi"
- Mot de passe oublié

### Dashboard
- Vue d'ensemble de tous vos sites
- Statistiques : nombre de sites, sites actifs, stockage utilisé
- Recherche et filtrage de sites
- Accès rapide à la gestion de chaque site

### Internationalisation
- Basculer entre français et anglais
- Changement de langue en temps réel
- Persistance de la préférence linguistique

## 🧪 Scripts disponibles

```bash
npm run dev          # Démarrer le frontend en mode développement
npm run build        # Compiler le frontend pour la production
npm run preview      # Prévisualiser le build de production
npm run server       # Démarrer le backend
```

## 📝 License

MIT

## 👨‍💻 Auteur

Développé par [luoxthedev](https://github.com/luoxthedev)
