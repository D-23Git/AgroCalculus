const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (config) => {
      // 1. Polyfill fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        util: require.resolve("util/"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser"),
        url: require.resolve("url/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
      };

      // 2. EXPLICIT ALIAS
      config.resolve.alias = {
        ...config.resolve.alias,
        "process/browser": require.resolve("process/browser.js"),
      };

      // 3. Fix ESM "Fully Specified" error for Redux Toolkit & others
      if (config.module && config.module.rules) {
        config.module.rules.push({
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        });
      }

      // 4. Provide Plugins
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      return config;
    },
  },
};
