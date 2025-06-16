/**
 * package.js - Creates distributable extension package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, 'dist');
const PACKAGE_NAME = 'prompt-scrubber-extension-v1.0.0.zip';

// Simple zip creation (in production, use proper zip library)
console.log('[Extension Package] Creating extension package...');
console.log('[Extension Package] Files ready in:', DIST_DIR);
console.log('[Extension Package] Manual zip creation required for:', PACKAGE_NAME);
console.log('[Extension Package] Zip the contents of the dist/ folder');