const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const Transaction = require("../models/Transaction");
const { createCustomError } = require("../errors/custom-error");
const asyncWrapper = require("../middleware/async");

// 1. Get All Transactions for Logged-In User (with optional query filters)
const getTransactions = asyncWrapper(async (req, res, next) => {
  const { type, category, startDate, endDate } = req.query;
  const queryObject = { userId: req.user.userId };

  if (type) {
    queryObject.type = type;
  }
  if (category) {
    queryObject.category = category;
  }
  if (startDate || endDate) {
    queryObject.date = {};
    if (startDate) queryObject.date.$gte = new Date(startDate);
    if (endDate) queryObject.date.$lte = new Date(endDate);
  }

  // Fetch sorted by date newest first
  const transactions = await Transaction.find(queryObject).sort("-date");

  res.status(StatusCodes.OK).json({ transactions, count: transactions.length });
});

// 2. Create Transaction
const createTransaction = asyncWrapper(async (req, res, next) => {
  const { title, amount, type, category } = req.body;

  if (!title || !amount || !type || !category) {
    return next(
      createCustomError(
        "Please provide title, amount, type, and category",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // Inject user ID from verified JWT
  req.body.userId = req.user.userId;
  const transaction = await Transaction.create(req.body);

  res.status(StatusCodes.CREATED).json({ transaction });
});

// 3. Update Transaction
const updateTransaction = asyncWrapper(async (req, res, next) => {
  const { id: transactionId } = req.params;
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId: req.user.userId },
    req.body,
    { new: true, runValidators: true },
  );

  if (!transaction) {
    return next(
      createCustomError(
        `No transaction found with ${transactionId}`,
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  res.status(StatusCodes.OK).json({ transaction });
});

// 4. Delete Transaction
const deleteTransaction = asyncWrapper(async (req, res, next) => {
  const { id: transactionId } = req.params;
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId: req.user.userId,
  });

  if (!transaction) {
    return next(
      createCustomError(
        `No transaction found with ${transactionId}`,
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Transaction deleted succesfully", transaction });
});

// 5. Get Financial Summary (Total Income, Total Expense, Net Balance)
const getSummary = asyncWrapper(async (req, res, next) => {
  const stats = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Transform aggregate array into clean summary metrics
  let totalIncome = 0;
  let totalExpense = 0;

  stats.forEach((item) => {
    if (item._id === "income") totalIncome = item.totalAmount;
    if (item._id === "expense") totalExpense = item.totalAmount;
  });

  const netBalance = totalIncome - totalExpense;

  res.status(StatusCodes.OK).json({
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
    },
  });
});

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
