import { useState } from "react";
import { useExpense } from "../context/ExpenseContext";

const CATEGORIES = [
  "Housing",
  "Food",
  "Utilities",
  "Salary",
  "Entertaiment",
  "Transportation",
  "Investment",
  "Other",
];

const TransactionForm = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { fetchExpenseData } = useExpense();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      setError("Please provide a valid title and positive amount.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: numAmount,
          type,
          category,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory(CATEGORIES[0]);

        fetchExpenseData();
      } else {
        setError(data.msg || "Failed to add transaction");
      }
    } catch (err) {
      setError(err.message || "Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3>Add New Transaction</h3>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="tx-title">Title</label>
          <input
            type="text"
            id="tx-title"
            placeholder="e.g. Monthly Salary or Grocery Shopping"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="input-group">
            <label htmlFor="tx-amount">Amount ($)</label>
            <input
              type="number"
              id="tx-amount"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="tx-type">Type</label>
            <select
              id="tx-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontFamily: "var(--font-sans)",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              <option value="expense">Expense (-)</option>
              <option value="income">Income (+)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="tx-category">Category</label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontFamily: "var(--font-sans)",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            {CATEGORIES.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: "100%", marginTop: "8px" }}
        >
          {isSubmitting ? "Adding Transaction..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
