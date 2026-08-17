import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session || !req.session.userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }
  next();
};
