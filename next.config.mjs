const wordpressBaseUrl =
  process.env.NEXT_PUBLIC_WP_URL ||
  process.env.WP_API_URL ||
  process.env.NEXT_PUBLIC_WP_API_URL ||
  '';

const remotePatterns = [];

if (wordpressBaseUrl) {
  try {
    const wordpressUrl = new URL(wordpressBaseUrl);
    if (wordpressUrl.protocol === 'https:' || wordpressUrl.protocol === 'http:') {
      remotePatterns.push({
        protocol: wordpressUrl.protocol === 'https:' ? 'https' : 'http',
        hostname: wordpressUrl.hostname,
        port: wordpressUrl.port,
        pathname: '/**',
      });
    }
  } catch {
    // A aplicação valida a configuração novamente ao consultar o catálogo.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [480, 640, 750, 828, 1080, 1440, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75, 82],
    remotePatterns,
  },
};

export default nextConfig;
