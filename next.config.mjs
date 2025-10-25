/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore React Native dependencies that are not needed in web apps
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    
    // Ignore React Native modules
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        '@react-native-async-storage/async-storage': 'commonjs @react-native-async-storage/async-storage',
      });
    }
    
    return config;
  },
}

export default nextConfig
