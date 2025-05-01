/**
 * Smart Card Tunisia - Minimal Server Startup File
 * 
 * This file starts the server using the minimal Express application
 */

const app = require('./app.minimal');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
