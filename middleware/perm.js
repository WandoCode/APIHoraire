/* Control permission following user's 'role' or id */
exports.userIs = (...args) => {
  return (req, res, next) => {
    for (let i = 0; i < args.length; i++) {
      const role = args[i];
      // Access authorized
      if (req.user.role === role) return next();
      if (role === "self") {
        if (req.user.id === req.params.id) return next();
      }
    }

    // Access denied
    const roles = printsAuthRoles(args);
    return res
      .status(401)
      .send(`Unauthorized access. User role has to be ${roles}`);
  };
};

/*
  Returns a string with all element in 'roles' argument binded with 'or'
 */
const printsAuthRoles = (roles) => {
  let rolesString = "";
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    rolesString += role + " or ";
  }
  return (rolesString = rolesString.slice(0, -3));
};
