const path = require('path')

module.exports = {
  reactStrictMode: true,
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
  },

  experimental: {
    workerThreads: false,
    cpus: 1
  },

  async rewrites() {
    return [
      {
        source: '/open-data/:path*',
        destination: '/api/serve-file/:path*',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:portail*",
        has: [
          {
            type: "host",
            value: "portail.lasocietenouvelle.org",
          },
        ],
        destination: "https://lasocietenouvelle.org/portail",
        permanent: true,
      },
    ];
  },
};
