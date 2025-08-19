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
