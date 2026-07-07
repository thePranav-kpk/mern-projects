const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors/custom-error");

const auth = async (req, res, next) => {
  // Check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new CustomAPIError("Authentication invalid", StatusCodes.UNAUTHORIZED),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user to the request object
    req.user = { userId: payload.userId, name: payload.name };
    next();
  } catch (error) {
    return next(
      new CustomAPIError("Authentication invalid", StatusCodes.UNAUTHORIZED),
    );
  }
};

module.exports = auth;
