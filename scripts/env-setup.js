#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * =============================================================================
 * Environment Setup Helper Script
 * =============================================================================
 * Helps users set up the new centralized environment configuration system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECT_NAME = path.basename(ROOT_DIR);
const ENV_CONFIG_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.env-configs'
);
const TARGET_ENV_FILE = path.join(ENV_CONFIG_DIR, `${PROJECT_NAME}.env`);
const OLD_ENV_FILE = path.join(ROOT_DIR, '.env.source-of-truth.local');

/**
 * Main setup function
 */
function main() {
  console.log('🔧 Environment Configuration Setup');
  console.log('='.repeat(50));
  console.log(`Project: ${PROJECT_NAME}`);
  console.log(`Target location: ${TARGET_ENV_FILE}`);
  console.log('');

  try {
    // Create the config directory
    if (!fs.existsSync(ENV_CONFIG_DIR)) {
      console.log('📁 Creating ~/.env-configs directory...');
      fs.mkdirSync(ENV_CONFIG_DIR, { recursive: true });
      console.log('✅ Directory created');
    } else {
      console.log('✅ ~/.env-configs directory already exists');
    }

    // Create backup directory
    const backupDir = path.join(ENV_CONFIG_DIR, 'backups', PROJECT_NAME);
    if (!fs.existsSync(backupDir)) {
      console.log('📁 Creating backup directory...');
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('✅ Backup directory created');
    } else {
      console.log('✅ Backup directory already exists');
    }

    // Check if target file already exists
    if (fs.existsSync(TARGET_ENV_FILE)) {
      console.log('✅ Environment configuration file already exists');
      console.log('');
      console.log('🎯 Next steps:');
      console.log(
        '   • Update your configuration: vim ~/.env-configs/' +
          PROJECT_NAME +
          '.env'
      );
      console.log('   • Run sync: bun run sync-env --deployment=dev');
      return;
    }

    // Try to copy from old location
    if (fs.existsSync(OLD_ENV_FILE)) {
      console.log('📋 Copying existing .env.source-of-truth.local...');
      fs.copyFileSync(OLD_ENV_FILE, TARGET_ENV_FILE);
      console.log('✅ Environment file copied');

      // Set secure permissions
      fs.chmodSync(TARGET_ENV_FILE, 0o600);
      console.log('✅ Secure permissions set (600)');

      console.log('');
      console.log('🎯 Migration complete! Next steps:');
      console.log('   • Old file: ' + OLD_ENV_FILE);
      console.log('   • New file: ' + TARGET_ENV_FILE);
      console.log(
        '   • Test sync: bun run sync-env --deployment=dev --dry-run'
      );
      console.log(
        '   • Delete old file after verification: rm .env.source-of-truth.local'
      );
    } else {
      console.log('📝 Creating example environment file...');
      const exampleContent = createExampleEnvFile();
      fs.writeFileSync(TARGET_ENV_FILE, exampleContent);
      fs.chmodSync(TARGET_ENV_FILE, 0o600);
      console.log('✅ Example environment file created');
      console.log('');
      console.log('🎯 Next steps:');
      console.log(
        '   • Edit your configuration: vim ~/.env-configs/' +
          PROJECT_NAME +
          '.env'
      );
      console.log('   • Add your actual API keys and secrets');
      console.log(
        '   • Test sync: bun run sync-env --deployment=dev --dry-run'
      );
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * Creates an example environment file template
 */
function createExampleEnvFile() {
  return `| TARGET               | GROUP                       | KEY                       | DEV_VALUE                                                                                                                                                                  | PROD_VALUE                                                                                                                                                                 |
|----------------------|-----------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NEXTJS,CONVEX,GITHUB | Local Development           | NEXT_PUBLIC_APP_URL       | http://localhost:3000                                                                                                                                                      | https://your-domain.pages.dev                                                                                                                                             |
| NEXTJS,GITHUB        | Production URL              | NEXT_PUBLIC_PROD_APP_URL  | https://your-domain.pages.dev                                                                                                                                             | https://your-domain.pages.dev                                                                                                                                             |
| NEXTJS,GITHUB        | Repository                  | NEXT_PUBLIC_GITHUB_REPO   | https://github.com/your-org/your-repo                                                                                                                                     | https://github.com/your-org/your-repo                                                                                                                                     |
| NEXTJS,CONVEX        | Local Development           | PORT                      | 3000                                                                                                                                                                       | 3000                                                                                                                                                                       |
| CONVEX               | GitHub OAuth                | GITHUB_CLIENT_ID          | your-github-client-id                                                                                                                                                      | your-github-client-id                                                                                                                                                      |
| CONVEX               | GitHub OAuth                | GITHUB_CLIENT_SECRET      | your-github-client-secret                                                                                                                                                  | your-github-client-secret                                                                                                                                                  |
| CONVEX               | OAuth                       | OAUTH_SECRET              | your-oauth-secret                                                                                                                                                          | your-oauth-secret                                                                                                                                                          |
| CONVEX               | LLM Config                  | OPENAI_API_KEY            | your-openai-api-key                                                                                                                                                        | your-openai-api-key                                                                                                                                                        |
| CONVEX               | Convex                      | CONVEX_DEPLOYMENT         | dev:your-deployment                                                                                                                                                        | production:your-deployment                                                                                                                                                 |
| NEXTJS,CONVEX,GITHUB | Convex                      | NEXT_PUBLIC_CONVEX_URL    | https://your-deployment.convex.cloud                                                                                                                                       | https://your-deployment.convex.cloud                                                                                                                                       |
`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
