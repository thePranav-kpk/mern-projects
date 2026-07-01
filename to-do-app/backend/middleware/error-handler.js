const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors/custom-error");

const errorHandlerMiddleware = (err, req, res, next) => {
  // Handle Custom API Errors (e.g. 404 Not Found)
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((item) => item.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: messages.join(", ") });
  }

  // Handle Mongoose Cast Errors
  if (err.name === "CastError") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `No item found with id: ${err.value}` });
  }

  // Fallback generic server error
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "Something went wrong, please try again" });
};

module.exports = errorHandlerMiddleware;
