const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/auth");
const authMiddleware = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe); // Protect "/me" with our authMiddleware

module.exports = router;
