import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self' 'unsafe-inline' ;
    script-src 'self' 'unsafe-eval' 'unsafe-inline'  ;
    font-src 'self'  data:;
    style-src 'self' 'unsafe-inline' https://flow.spaceaiapp.com  https://cdn.jsdelivr.net;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://codesandbox.io/api/v1/sandboxes/define;
    frame-ancestors 'self' localhost:3000;
    frame-src 'self' localhost:3000 https://flow.spaceaiapp.com http://localhost:3000 https://localhost:3000 https://aksel.ansatt.dev.nav.no;
    media-src 'self'  cdn.sanity.io;
    img-src 'self' blob: data: cdn.sanity.io  https://flow.spaceaiapp.com https://avatars.githubusercontent.com data: ;
    connect-src 'self'  https://flow.spaceaiapp.com  https://raw.githubusercontent.com/navikt/ https://hnbe3yhs.apicdn.sanity.io wss://hnbe3yhs.api.sanity.io cdn.sanity.io *.api.sanity.io https://umami.nav.no https://main--66b4b3beb91603ed0ab5c45e.chromatic.com;
    
`;

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "*",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer-when-downgrade",
  },
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
  },
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\n/g, ""),
  },
];
const nextConfig: NextConfig = {
    headers: async () => {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
