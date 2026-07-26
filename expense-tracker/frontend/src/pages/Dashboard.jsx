import { useEffect } from "react";
import { useExpense } from "../context/ExpenseContext";
import CategoryBreakdown from "../components/CategoryBreakdown";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

const Dashboard = () => {
  const { loading, error, fetchExpenseData } = useExpense();

  useEffect(() => {
    fetchExpenseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="main-content">
        {error ? (
          <div className="error-message">{error}</div>
        ) : loading ? (
          <p
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--text-secondary)",
            }}
          >
            Loading financial dashboard...
          </p>
        ) : (
          <div>
            <SummaryCards />

            <div className="dashboard-sections">
              <div>
                <TransactionForm />
                <div style={{ marginTop: "30px" }}>
                  <CategoryBreakdown />
                </div>
              </div>

              <TransactionList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
