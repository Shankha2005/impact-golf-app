/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/webhooks', destination: '/api/payments' }];
  },
};

export default nextConfig;
