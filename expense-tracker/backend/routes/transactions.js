const express = require("express");
const router = express.Router();

const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require("../controllers/transactions");

const authMiddleware = require("../middleware/auth");

// Protect all transaction routes
router.use(authMiddleware);

router.route("/summary").get(getSummary);
router.route("/").get(getTransactions).post(createTransaction);
router.route("/:id").patch(updateTransaction).delete(deleteTransaction);

module.exports = router;
