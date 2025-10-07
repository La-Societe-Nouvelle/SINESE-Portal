const path = require('path');

module.exports = {
  reactStrictMode: true,

  // Options pour Sass
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
  },

  // Expérimental : gestion CPU / worker (optionnel)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Filtrage des warnings répétitifs Webpack (SCSS/PostCSS)
  webpack: (config, { dev }) => {
    if (dev) {
      config.ignoreWarnings = [
        {
          message: /repetitive deprecation warnings omitted/,
        },
      ];
    }
    return config;
  },

};
