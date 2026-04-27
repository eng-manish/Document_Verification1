module.exports = (roles) => {
  return (req, res, next) => {
    // Check if the user exists and has the correct role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Forbidden: You do not have permission to access this." 
      });
    }
    next();
  };
};