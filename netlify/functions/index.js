// Simple Netlify serverless function for index route
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Smart Card Tunisia API is running' })
  };
};
