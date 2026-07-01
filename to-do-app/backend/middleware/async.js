const asyncWrapper = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error); // Pass the error to the next middleware (error handler)
    }
  };
};

module.exports = asyncWrapper;
