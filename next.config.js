/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicionar suporte para as bibliotecas que usam recursos de Node.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Não incluir bibliotecas de servidor no cliente
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
  // Corrigido: usar serverExternalPackages em vez de serverComponentsExternalPackages
  serverExternalPackages: [
    '@whiskeysockets/baileys',
    'sharp',
    'jimp',
    'qrcode-terminal',
    'link-preview-js',
  ],
  // Corrigido: usar true em vez de serverActions: true
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 