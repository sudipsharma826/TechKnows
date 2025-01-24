/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com','lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/page/post/create',
        destination: '/page/dashboard?tab=createpost',
        permanent: true, // Set to true for 301 redirect or false for 302 redirect
      },
      {
        source: '/page/adminrequest',
        destination: '/page/dashboard?tab=adminrequest',
        permanent: true, // Set to true for 301 redirect or false for 302 redirect
      },
      {
        source: '/page/requests',
        destination: '/page/dashboard?tab=requests',
        permanent: true, // Set to true for 301 redirect or false for 302 redirect
      },
    ];
  },
};

export default nextConfig;
