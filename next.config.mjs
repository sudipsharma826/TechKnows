// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
//Default Code Above
//To optilized the resources we can use the below code
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React Strict Mode
    reactStrictMode: true,
  
    // Enable image optimization (useful if you're using <Image> component)
    images: {
      domains: ['your-image-domain.com'], // Replace with the domains of your images
    },
  
    // Webpack configuration for chunk splitting and optimizations
    webpack(config, { isServer }) {
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          minSize: 20000, // Set the minimum size for chunking
          maxSize: 70000, // Set the maximum size for chunks
        };
      }
      return config;
    },
  
    // Cache headers for static assets
    async headers() {
      return [
        {
          source: '/:all*(svg|jpg|png|gif|woff2|woff|css|js)', // Apply for static assets
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable', // Cache assets for a year
            },
          ],
        },
      ];
    },
  
    // Automatic Static Optimization for pages without dynamic content
    staticPageGenerationTimeout: 60, // Timeout for static page generation (in seconds)
  };
  
  export default nextConfig;
  