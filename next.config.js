// Next.js settings. Redirects are managed in siteConfig.js, not here.
import siteConfig from "./siteConfig.js";

const both = (p) => {
  const clean = "/" + p.replace(/^\/+|\/+$/g, "");
  return [clean, clean + "/"];
};

const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return (siteConfig.redirects || []).flatMap((r) =>
      both(r.from).map((source) => ({ source, destination: r.to, permanent: r.permanent !== false }))
    );
  },
  async headers() {
    return [{ source: "/assets/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] }];
  },
};

export default nextConfig;
