import { createContext, useContext, useReducer, useCallback } from "react";

const ExpenseContext = createContext();

const initialState = {
  transactions: [],
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  },
  breakdown: [],
  loading: true,
  error: null,
};

// Reducer function: Receives (currentState, action) and returns new state
function expenseReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        transactions: action.payload.transactions,
        summary: action.payload.summary,
        breakdown: action.payload.breakdown,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // useCallback memoizes the function ref to avoid re-creating on every render
  // Takes (function, dependencies) as params
  const fetchExpenseData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Dispatch takes an action as an object
    dispatch({ type: "FETCH_START" });

    try {
      // Allows parallel calling of 3 API requests
      const [txRes, sumRes, catRes] = await Promise.all([
        fetch("/api/v1/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/v1/transactions/summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/v1/transactions/category-breakdown?type=expense", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const txData = await txRes.json();
      const sumData = await sumRes.json();
      const catData = await catRes.json();

      if (txRes.ok && sumRes.ok && catRes.ok) {
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            transactions: txData.transactions || [],
            summary: sumData.summary || {
              totalIncome: 0,
              totalExpense: 0,
              netBalance: 0,
            },
            breakdown: catData.breakdown || [],
          },
        });
      } else {
        dispatch({
          type: "FETCH_ERROR",
          payload: "Failed to load financial data",
        });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err.message || "Server connection failed",
      });
    }
  }, []);

  return (
    <ExpenseContext.Provider value={{ ...state, dispatch, fetchExpenseData }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExpense = () => useContext(ExpenseContext);
