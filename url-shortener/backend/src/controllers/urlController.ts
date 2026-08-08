import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import Url from "../models/Url";

export const shortenUrl = async (req: Request, res: Response) => {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Please provide original URL" });
  }
  const url = await Url.findOne({ originalUrl });
  if (!url) {
    const shortCode = nanoid(6);
    const newUrl = await Url.create({ originalUrl, shortCode });
    return res.status(StatusCodes.CREATED).json(newUrl);
  }
  return res.status(StatusCodes.OK).json(url);
};

export const redirectUrl = async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const url = await Url.findOneAndUpdate(
    { shortCode },
    { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } },
    { new: true },
  );
  if (!url) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: "URL not found" });
  }
  res.redirect(url.originalUrl);
};

export const getUrlStats = async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode });
  if (!url) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: "Short URL not found" });
  }
  res.status(StatusCodes.OK).json(url);
};
