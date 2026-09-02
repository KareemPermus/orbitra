/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.preview.myndlab.ai', '*.hotload.myndlab.ai', '*.localhost', 'localhost'],
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;