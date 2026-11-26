/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // One address for everything: moovma.tn (printed as a QR code on the back of Elyssa) and the Vercel main-branch
  // address forward permanently to https://www.moovma.tn, keeping the page path. Preview deployments are not touched.
  async redirects() {
    return ['moovma.tn', 'moovma-git-main-moovma.vercel.app'].map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: 'https://www.moovma.tn/:path*',
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/elyssa_3d/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
