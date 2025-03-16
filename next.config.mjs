const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wav|mp3)$/,
      type: "asset/resource",
      generator: {
        filename: "static/sounds/[name].[hash][ext]",
        publicPath: "/_next/",
      },
    });

    return config;
  },
  reactStrictMode: false,
  transpilePackages: ["jotai-devtools"],
};

export default nextConfig;
