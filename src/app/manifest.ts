import type { MetadataRoute } from "next";

// biome-ignore lint/style/noDefaultExport: Required by Next.js route handler conventions.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YTyping",
    short_name: "YTy",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b5a7d",
    icons: [
      {
        src: "/logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
