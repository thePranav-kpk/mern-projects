import { useExpense } from "../context/ExpenseContext";

const CategoryBreakdown = () => {
  const { breakdown } = useExpense();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="section-box">
        <h3 className="section-title">Category Breakdown</h3>
        <p
          style={{
            color: "var(--text-secondary)",
            textAlign: "center",
            padding: "30px 0",
          }}
        >
          No expense transactions recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="section-box">
      <h3 className="section-title">Category Breakdown</h3>
      <div
        className="category-list"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {breakdown.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <div>
              <span style={{ fontWeight: "600", display: "block" }}>
                {item.category}
              </span>
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                {item.count} {item.count === 1 ? "transaction" : "transactions"}
              </span>
            </div>
            <span style={{ fontWeight: "700", color: "var(--color-danger)" }}>
              {formatCurrency(item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
