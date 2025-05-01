/**
 * Build script for Netlify
 * 
 * This script ensures the client/dist directory exists before Netlify tries to deploy
 */

const fs = require('fs');
const path = require('path');

// Create client/dist directory if it doesn't exist
const distDir = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating client/dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
  
  // Create a simple index.html file
  const indexPath = path.join(distDir, 'index.html');
  const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Card Tunisia</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #0F172A;
      color: white;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 20px;
    }
    h1 {
      color: #3B82F6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Smart Card Tunisia</h1>
    <p>Welcome to Smart Card Tunisia. The application is being built...</p>
  </div>
</body>
</html>
  `;
  fs.writeFileSync(indexPath, indexContent);
  console.log('Created index.html in client/dist');
}

console.log('Build preparation complete!');
