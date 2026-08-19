import express from "express";
import { protect } from "../middleware/auth";
import { getRoomMessages } from "../controllers/message";

const router = express.Router();

router.get("/:room", protect, getRoomMessages);

export default router;
