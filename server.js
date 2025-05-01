/**
 * Smart Card Tunisia - Server Startup File
 * 
 * This file starts the server using the Express application configured in app.js
 */

const app = require('./app');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
