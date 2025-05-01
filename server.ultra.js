/**
 * Smart Card Tunisia - Ultra Minimal Server Startup File
 * 
 * This file starts the server using the ultra minimal Express application
 */

const app = require('./app.ultra');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Ultra minimal server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
