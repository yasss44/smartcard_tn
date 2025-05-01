// Middleware to check if user is an admin
const adminAuth = (req, res, next) => {
  try {
    console.log('Admin middleware called');
    console.log('User object:', req.user);

    // Check if user exists and is an admin
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has admin privileges using the is_admin field
    if (!req.user.is_admin) {
      console.log('User is not an admin:', req.user.email);
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    console.log('Admin access granted for user:', req.user.email);
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ message: 'Admin authentication failed' });
  }
};

module.exports = adminAuth;
