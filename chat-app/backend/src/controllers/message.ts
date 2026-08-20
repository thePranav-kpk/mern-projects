import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Message from "../models/Message";

export const getRoomMessages = async (req: Request, res: Response) => {
  const { room } = req.params;
  if (!room) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "" });
  }

  const messages = await Message.find({ room })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  res.status(StatusCodes.OK).json({ room, messages });
};

