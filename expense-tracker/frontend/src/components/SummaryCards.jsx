import { useExpense } from "../context/ExpenseContext";

const SummaryCards = () => {
  const { summary } = useExpense();
  const { totalIncome, totalExpense, netBalance } = summary;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="summary-cards-grid">
      {/* 1.Net Balance Card */}
      <div className="summary-card balance-grid">
        <span className="card-label">Net Balance</span>
        <h2
          className={`card-value ${netBalance >= 0 ? "text-success" : "text-danger"}`}
        >
          {formatCurrency(netBalance)}
        </h2>
      </div>

      {/* 2.Total Income Card */}
      <div className="summary-card income-grid">
        <span className="card-label">Total Income</span>
        <h2 className="card-value text-success">
          +{formatCurrency(totalIncome)}
        </h2>
      </div>

      {/* 3.Total Expense Card */}
      <div className="summary-card expense-grid">
        <span className="card-label">Total Expenses</span>
        <h2 className="card-value text-danger">
          -{formatCurrency(totalExpense)}
        </h2>
      </div>
    </div>
  );
};

export default SummaryCards;
