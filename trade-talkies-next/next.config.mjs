/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Often causes double-renders with sockets in dev
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
};

export default nextConfig;
