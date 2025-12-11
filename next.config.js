const path = require('path');

module.exports = {
  reactStrictMode: true,

  // Options pour Sass
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
  },

  // Filtrage des warnings répétitifs Webpack (SCSS/PostCSS)
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        message: /repetitive deprecation warnings omitted/,
      },
      {
        message: /Sass @import rules are deprecated/,
      },
    ];
    return config;
  },

};
