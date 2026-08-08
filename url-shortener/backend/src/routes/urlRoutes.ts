import express from "express";
import {
  shortenUrl,
  redirectUrl,
  getUrlStats,
} from "../controllers/urlController";

const router = express.Router();

router.post("/shorten", shortenUrl);
router.get("/stats/:shortCode", getUrlStats);
router.get("/r/:shortCode", redirectUrl);

export default router;
