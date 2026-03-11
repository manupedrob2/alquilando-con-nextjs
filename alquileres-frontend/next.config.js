/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:5234/api/:path*', // Proxy interno Docker
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: '/api', // Usar proxy en lugar de URL directa
  },
}

module.exports = nextConfig
