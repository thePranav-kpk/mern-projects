const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-error");

// 1.Register User
const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(
      createCustomError(
        "Please provide name, email and password",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // Create User (Mongoose hashes password automatically)
  const user = await User.create({ name, email, password });
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
    },
    token,
  });
});

// 2.Login User
const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      createCustomError(
        "Please provide email and password",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      createCustomError("Invalid Credentials", StatusCodes.UNAUTHORIZED),
    );
  }

  // Compare passwords
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(
      createCustomError("Invalid Credentials", StatusCodes.UNAUTHORIZED),
    );
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
    },
    token,
  });
});

// 3.Get logged in user profile (Requires auth middleware) Auto-login and persisting user sessions
const getMe = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) {
    return next(createCustomError("User not found", StatusCodes.NOT_FOUND));
  }

  res.status(StatusCodes.OK).json({ user });
});

module.exports = { register, login, getMe };
