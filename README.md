# Statix

A modern static site hosting platform with file management and real-time deployment.
Statix is **THE** open-source alternative to Netlify.

[🇫🇷 Version française](README.fr.md)

## 🚀 Features

- **Static site management**: Easily upload and manage your HTML/CSS/JS sites
- **Multilingual interface**: Support for French and English (real-time language switching)
- **Intuitive dashboard**: View your sites, statistics, and files at a glance
- **Instant deployment**: Your sites are accessible immediately after upload
- **Subdomain routing**: Access your sites via `slug.lvh.me:3000` or `/sites/id/`
- **Configurable main file**: Choose which HTML file to serve by default
- **Secure authentication**: Login/register system with JWT
- **File management**: Upload, delete, and organize your files

## 🛠️ Technologies

### Frontend
- **React 18** with TypeScript
- **Vite** for build and dev server
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **i18next** for internationalization
- **Framer Motion** for animations

### Backend
- **Express.js** for REST API
- **SQLite** for database (default), with support for **MySQL/MariaDB** and **Supabase (Postgres)**
- **Multer** for file uploads
- **JWT** for authentication
- **bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/luoxthedev/static-site-host.git
cd static-site-host

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## 🚀 Getting Started

### Quick Start (both servers)

```bash
# From the root folder, start the backend
npm run server

# In another terminal, start the frontend
npm run dev
```

### Manual Start

**Backend** (port 3000):
```bash
cd server
npm start
```

**Frontend** (port 8080):
```bash
npm run dev
```

## 🌐 Access

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Deployed sites**: 
  - By ID: http://localhost:3000/sites/[site-id]/
  - By subdomain: http://[slug].lvh.me:3000/

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `server/` folder (see `server/.env.example`):

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
SITES_ROOT=uploads
```

### Database Configuration

Statix supports three database backends. Set `DB_TYPE` in your `.env` file:

#### SQLite (default – local file, no setup needed)

```env
DB_TYPE=sqlite
SQLITE_FILE=./database.sqlite
```

#### MySQL / MariaDB (VPS)

Install the driver first:
```bash
cd server && npm install mysql2
```

```env
DB_TYPE=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=statix
```

#### Supabase (Postgres)

Install the driver first:
```bash
cd server && npm install pg
```

Then use the **direct connection string** from the Supabase Dashboard (Settings → Database):

```env
DB_TYPE=supabase
SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
SUPABASE_SSL=true
```

### Server Configuration

Modify `server/config.js` to customize:

```javascript
module.exports = {
  appDomain: 'lvh.me',        // Domain for subdomains
  port: 3000,                 // Server port
  sitesRoot: 'uploads',       // Sites storage folder
  enableSubdomains: true      // Enable subdomain routing
};
```

## 📁 Project Structure

```
.
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   ├── stores/            # State management (Zustand)
│   ├── locales/           # Translation files (FR/EN)
│   └── lib/               # Utilities
├── server/                # Backend source code
│   ├── routes/            # Express routes
│   ├── middleware/        # Middleware (auth, etc.)
│   ├── database/          # Database adapters (sqlite, mysql, supabase)
│   ├── uploads/           # Hosted sites
│   ├── database.js        # Database initialisation (adapter selection)
│   └── index.js           # Backend entry point
└── public/                # Static assets
```

## 🔑 Key Features

### Site Management
- Create a new site with name and slug
- Upload files (HTML, CSS, JS, images, etc.)
- Set a custom main file
- Delete files
- Redeploy a site

### Authentication
- Registration with name, email, and password
- Login with JWT
- "Remember me" option
- Forgot password

### Dashboard
- Overview of all your sites
- Statistics: number of sites, active sites, storage used
- Site search and filtering
- Quick access to each site management

### Internationalization
- Switch between French and English
- Real-time language switching
- Language preference persistence

## 🧪 Available Scripts

```bash
npm run dev          # Start the frontend in development mode
npm run build        # Build the frontend for production
npm run preview      # Preview the production build
npm run server       # Start the backend
```

## 📝 License

MIT

## 👨‍💻 Author

Developed by [luoxthedev](https://github.com/luoxthedev)
