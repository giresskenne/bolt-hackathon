// webpack.config.js  ────────────────────────────────────────────
// ▸ Same structure you gave, with two tweaks:
//   1. Provide a default for `mode` when the CLI doesn’t pass --mode
//      → fixes “The 'mode' option has not been set”.
//   2. Feed that same value into DefinePlugin
//      → fixes “Conflicting values for 'process.env.NODE_ENV'”.

import path                   from 'path';
import { fileURLToPath }      from 'url';
import TerserPlugin           from 'terser-webpack-plugin';
import webpack                from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** Helpers ─────────────────────────────────────────────────── */
export default (env, argv = {}) => {
  // ⚠️  If the user runs plain `npx webpack`, argv.mode is undefined.
  //     We default to 'production' so webpack doesn’t warn.
  const mode   = argv.mode || 'production';
  const isProd = mode === 'production';

  return {
    // -----------------------------------------------------------------
    // Core build settings
    // -----------------------------------------------------------------
    mode,                                // development / production
    target: 'web',                       // bg script is still a worker

    entry: {
      contentScript: [
        './src/redactor.js',
        './src/contentScript.js'
      ],
      bg: './src/bg.js'                  // MV3 service-worker
    },

    output: {
      path:     path.resolve(__dirname, 'dist/src'),
      filename: '[name].js',             // → contentScript.js, bg.js
      iife:     true                     // classic scripts (needed for CS & SW)
    },

    // -----------------------------------------------------------------
    // Optimisation & minification
    // -----------------------------------------------------------------
    optimization: {
      minimize : true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: { comments: false }, // drop banner comments
            compress: {
              // Strip noisy console calls ONLY in production bundles
              pure_funcs: isProd
                ? ['console.log', 'console.info', 'console.debug']
                : []
            }
          },
          extractComments: false         // don’t emit *.LICENSE.txt
        })
      ]
    },

    // -----------------------------------------------------------------
    // Plugins
    // -----------------------------------------------------------------
    plugins: [
      // Inject the same mode value into client code
      // (Prevents DefinePlugin conflict warning.)
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode)
      })
    ],

    // -----------------------------------------------------------------
    // Module rules
    // -----------------------------------------------------------------
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader : 'babel-loader',
            options: {
              presets : [
                // Transpile only features not natively supported by Chrome 119+
                ['@babel/preset-env', { targets: { chrome: '119' } }]
              ],
              // Extra safety: remove console.* again at Babel stage in prod
              plugins : isProd
                ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
                : []
            }
          }
        }
      ]
    }
  };
};
