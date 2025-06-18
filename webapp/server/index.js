@@ .. @@
 import dotenv from 'dotenv';
 import { fileURLToPath } from 'url';
 import { dirname, join } from 'path';
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = dirname(__filename);
 
-// Load environment variables before other imports
-dotenv.config({ path: join(__dirname, '..', '.env') });
+// Load environment variables before other imports
+// Use .env.test for test environment, otherwise use .env
+const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
+dotenv.config({ path: join(__dirname, envFile) });
 
 // Debug environment variables
 console.log('Environment variables loaded:', {
   STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
   NODE_ENV: process.env.NODE_ENV,
-  ENV_FILE: join(__dirname, '..', '.env')
+  ENV_FILE: join(__dirname, envFile)
 });