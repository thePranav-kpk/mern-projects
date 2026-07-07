const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors/custom-error");

const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  // Handle MongoDB Duplicate Key (e.g. email already exists)
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `${fieldName} already exists.` });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((item) => item.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: messages.join(", ") });
  }

  if (err.name === "CastError") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `No item found with id: ${err.value}` });
  }

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "Something went wrong, please try again" });
};

module.exports = errorHandlerMiddleware;
