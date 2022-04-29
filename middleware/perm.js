/* Control permission following user's 'role' */
exports.userIs = (...args) => {
  return (req, res, next) => {
    for (let i = 0; i < args.length; i++) {
      const role = args[i];
      // Access authorized
      if (req.user.role === role) return next();
    }

    // Access denied

    // Prepare justification string
    let roles = "";
    for (let i = 0; i < args.length; i++) {
      const role = args[i];
      roles += role + " or ";
    }
    roles = roles.slice(0, -3);

    return res
      .status(401)
      .send(`Unauthorized access. User role has to be ${roles}`);
  };
};
