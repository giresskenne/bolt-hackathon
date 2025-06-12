// webpack.config.js - Extension bundling
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default {
  mode: 'production',
  entry: {
    contentScript: [
      './src/redactor.js',
      './src/contentScript.js'
    ],
    bg: './src/bg.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/src'),
    filename: '[name].js',
    iife: true
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: { 
          loader: 'babel-loader', 
          options: { presets: [] } 
        }
      }
    ]
  }
};