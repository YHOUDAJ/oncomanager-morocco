/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activer le mode strict React
  reactStrictMode: true,
  
  // Configuration des images externes (si nécessaire)
  images: {
    domains: [],
  },
  
  // Variables d'environnement publiques
  env: {
    APP_NAME: 'OncoManager Morocco',
    APP_VERSION: '0.1.0',
  },
};

module.exports = nextConfig;
