const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ftpConfig = {
  host: '91.200.103.154',
  user: 'accende1',
  password: '3asba888@',
  directory: '/smart-card.tn'
};

// Create deployment directory
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Copy server files
console.log('Copying server files...');
execSync(`xcopy /E /I /Y server ${path.join(deployDir, 'server')}`);

// Copy client build
console.log('Copying client build...');
execSync(`xcopy /E /I /Y client\\dist ${path.join(deployDir, 'client', 'dist')}`);

// Copy application startup files
console.log('Copying application startup files...');
fs.copyFileSync(path.join(__dirname, 'app.js'), path.join(deployDir, 'app.js'));
fs.copyFileSync(path.join(__dirname, 'server.js'), path.join(deployDir, 'server.js'));
fs.copyFileSync(path.join(__dirname, 'app.minimal.js'), path.join(deployDir, 'app.minimal.js'));
fs.copyFileSync(path.join(__dirname, 'server.minimal.js'), path.join(deployDir, 'server.minimal.js'));
fs.copyFileSync(path.join(__dirname, 'app.ultra.js'), path.join(deployDir, 'app.ultra.js'));
fs.copyFileSync(path.join(__dirname, 'server.ultra.js'), path.join(deployDir, 'server.ultra.js'));

// Create .env file for production
console.log('Creating production .env file...');
const envContent = `PORT=5000
DB_HOST=${process.env.DB_HOST || 'nfc-lucifer-nfc-lucifer.b.aivencloud.com'}
DB_PORT=${process.env.DB_PORT || '12639'}
DB_USER=${process.env.DB_USER || 'avnadmin'}
DB_PASSWORD=${process.env.DB_PASSWORD || 'AVNS_mxDPO2lgZRVAbKhlnfp'}
DB_NAME=${process.env.DB_NAME || 'defaultdb'}
JWT_SECRET=${process.env.JWT_SECRET || 'nfc_business_card_secret_key'}
`;

fs.writeFileSync(path.join(deployDir, 'server', '.env'), envContent);

// Create .env.no-db file for no-database mode
console.log('Creating no-database .env file...');
const noDbEnvContent = `# Application settings with database connection disabled
PORT=5000
NODE_ENV=production
SKIP_DB_CONNECTION=true

# JWT settings
JWT_SECRET=${process.env.JWT_SECRET || 'nfc_business_card_secret_key'}
`;

fs.writeFileSync(path.join(deployDir, '.env.no-db'), noDbEnvContent);

// Create package.json for production
console.log('Creating production package.json...');
const packageJson = {
  name: 'smart-card-tunisia',
  version: '1.0.0',
  description: 'Smart Card Tunisia - NFC Business Card Web App',
  main: 'server.js',
  scripts: {
    start: 'node server.js',
    'start:legacy': 'node server/index.js',
    'start:no-db': 'SKIP_DB_CONNECTION=true node server.js',
    'start:minimal': 'node server.minimal.js',
    'start:ultra': 'node server.ultra.js'
  },
  dependencies: {
    // Copy dependencies from server/package.json
    ...require('./server/package.json').dependencies
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create README with deployment instructions
console.log('Creating deployment instructions...');
const readmeContent = `# Smart Card Tunisia

## Deployment Instructions

1. Upload all files to the server at ${ftpConfig.directory}
2. Install dependencies: \`npm install\`
3. Start the application: \`npm start\`

## FTP Configuration
- Host: ${ftpConfig.host}
- Username: ${ftpConfig.user}
- Password: ${ftpConfig.password}
- Directory: ${ftpConfig.directory}

## Database Configuration
The database configuration is stored in the .env file.
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);

console.log('Deployment package created successfully!');
console.log(`Upload the contents of the '${deployDir}' directory to your server.`);
