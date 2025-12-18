const path = require('path');

module.exports = {
  reactStrictMode: true,

  // Options pour Sass
  sassOptions: {
    includePaths: [path.join(__dirname, 'app/styles')],
    quietDeps: true, // Supprime les warnings de dépendances (Bootstrap)
    silenceDeprecations: ['import', 'global-builtin', 'color-functions'], // Supprime les warnings de dépréciation Sass
  },

  // Filtrage des warnings Webpack
  webpack: (config, { isServer }) => {
    // Ignorer tous les warnings liés à Sass/Bootstrap
    config.ignoreWarnings = [
      // Warnings Sass généraux
      { module: /node_modules\/bootstrap/ },
      { message: /Deprecation Warning/ },
      { message: /repetitive deprecation warnings omitted/ },
      { message: /Sass @import rules are deprecated/ },
      { message: /Global built-in functions are deprecated/ },
      { message: /color-functions/ },
      { message: /red\(\) is deprecated/ },
      { message: /green\(\) is deprecated/ },
      { message: /blue\(\) is deprecated/ },
      { message: /Use math\.unit instead/ },
      { message: /Use color\.mix instead/ },
      { message: /Use color\.channel instead/ },
    ];

    return config;
  },

};
