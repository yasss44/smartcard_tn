/**
 * Smart Card Tunisia - Simple Server Startup File
 * 
 * This file starts the server using the simplified Express application
 */

const app = require('./app.simple');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
