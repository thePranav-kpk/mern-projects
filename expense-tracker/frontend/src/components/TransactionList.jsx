import { useExpense } from "../context/ExpenseContext";

const TransactionList = () => {
  const { transactions, dispatch, fetchExpenseData } = useExpense();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/v1/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
      fetchExpenseData();
    }
  };

  return (
    <div className="section-box">
      <h3 className="section-title">Transaction History</h3>
      {transactions.length === 0 ? (
        <p>No transaction history recorded yet.</p>
      ) : (
        transactions.map((item) => (
          <div
            key={item._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: "600",
                  display: "block",
                  fontSize: "1rem",
                }}
              >
                {item.title}
              </span>
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                {item.category} • {formatDate(item.date)}
              </span>
            </div>

            {/* Right Side: Amount & Delete Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                className={
                  item.type === "income" ? "text-success" : "text-danger"
                }
                style={{ fontWeight: "700", fontSize: "1.1rem" }}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </span>
              <button
                onClick={() => handleDelete(item._id)}
                className="logout-btn"
                title="Delete transaction"
                style={{ padding: "6px 12px" }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;
