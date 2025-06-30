export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
