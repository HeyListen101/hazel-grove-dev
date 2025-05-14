import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  crossOrigin: 'use-credentials',
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'googleusercontent.com',
    ],
    remotePatterns: [ // Using remotePatterns is the more modern approach
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
    ],
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseHostname = '';
    if (supabaseUrl) {
      try {
        supabaseHostname = new URL(supabaseUrl).hostname;
      } catch (e) {
        console.error("Invalid NEXT_PUBLIC_SUPABASE_URL for CSP:", e);
      }
    }

    // Define your Content Security Policy
    // Start with a reasonable base and adjust as needed.
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        // For Next.js development (hot module replacement, etc.)
        process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : "",
        // For inline scripts, consider using nonces or hashes in production if possible
        // For now, allowing unsafe-inline might be needed for some libraries or initial setup
        "'unsafe-inline'",
        // Allow scripts from Supabase if it loads any
        supabaseHostname ? `https://${supabaseHostname}` : "",
        // Add other trusted script sources if needed (e.g., analytics, auth providers)
        // 'https://apis.google.com',
      ].filter(Boolean), // Filter out empty strings
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Often needed for component libraries
        // Add other trusted style sources
      ],
      'img-src': [
        "'self'",
        'data:', // For inline SVGs or base64 images
        'lh3.googleusercontent.com',
        'googleusercontent.com',
        supabaseHostname ? `https://${supabaseHostname}` : "", // If Supabase serves images
        // Add other trusted image sources
      ].filter(Boolean),
      'font-src': ["'self'"], // Allow fonts from your own domain
      'connect-src': [
        "'self'",
        // Allow connections to Supabase (wss for realtime, https for API)
        supabaseHostname ? `wss://${supabaseHostname}` : "",
        supabaseHostname ? `https://${supabaseHostname}` : "",
        'https://cdn.jsdelivr.net',
        // Add other trusted API endpoints your app connects to
        // e.g. 'https://api.yourothersevice.com'
      ].filter(Boolean),
      'frame-src': [
        "'self'",
        // If you use iframes for things like Google Sign-In or other embeds
        // 'https://accounts.google.com',
      ],
      'object-src': ["'none'"], // Disallow <object>, <embed>, <applet>
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"], // Prevents clickjacking
      // 'report-uri': '/api/csp-reports', // Optional: Endpoint to send CSP violation reports
    };

    // Format the directives into a single string
    const cspValue = Object.entries(cspDirectives)
      .map(([key, valueArray]) => {
        // Ensure valueArray is always an array and filter out any falsy values
        const filteredValues = Array.isArray(valueArray) ? valueArray.filter(Boolean).join(' ') : '';
        return `${key} ${filteredValues}`;
      })
      .join('; ');

    return [
      {
        source: '/:path*', // Apply CSP to all paths
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Or SAMEORIGIN if you need to frame your own content
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Deprecated in modern browsers but doesn't hurt
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // HSTS - be careful with preload
          },
          // Permissions-Policy can also be useful
          // {
          //   key: 'Permissions-Policy',
          //   value: 'camera=(), microphone=(), geolocation=()',
          // }
        ],
      },
    ];
  },
};

export default nextConfig;